import pandas as pd
import numpy as np
import ast
import warnings
from itertools import product

# --- ML and NLP Libraries ---
# You must install these: pip install transformers torch scikit-learn lightgbm
from transformers import pipeline
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Suppress pandas warnings for cleaner output
warnings.filterwarnings('ignore', category=UserWarning, module='pandas')
warnings.filterwarnings('ignore', category=FutureWarning)


# --- NLP MODEL SETUP ---
print("Loading NLP model... (This may take a moment on first run)")
try:
    nlp_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    print("✅ NLP model loaded successfully.")
except Exception as e:
    print(f"❌ Could not load NLP model. Error: {e}")
    nlp_classifier = None


def load_and_clean_data(filepath):
    """
    Loads and cleans the initial drug dataset.
    """
    try:
        df = pd.read_csv(filepath)
        df.columns = df.columns.str.strip()
        
        if 'pmpm_cost' in df.columns:
            df['pmpm_cost'] = df['pmpm_cost'].astype(str).str.replace('$', '', regex=False).str.replace(',', '')
            df['pmpm_cost'] = pd.to_numeric(df['pmpm_cost'], errors='coerce')
            
        for col in ['drug_name', 'generic_name']:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip().str.upper()
                df[col].replace('NAN', np.nan, inplace=True)

        df['therapeutic_equivalence_code'].fillna('NA', inplace=True)
        df['drug_interactions'].fillna('[]', inplace=True)
        
        df.dropna(subset=['drug_name', 'generic_name', 'pmpm_cost', 'therapeutic_class'], inplace=True)
        
        print("✅ Dataset loaded and cleaned successfully.")
        return df
        
    except FileNotFoundError:
        print(f"❌ ERROR: The file was not found at '{filepath}'.")
        return None
    except Exception as e:
        print(f"❌ An unexpected error occurred while loading data: {e}")
        return None


def check_interaction_nlp(drug1_info, drug2_info):
    """
    Returns a numerical risk score (0 for none, 1 for low, 2 for high).
    """
    if nlp_classifier is None: return 0, "NLP model not available."
    
    interaction_description = None
    try:
        interactions1_data = drug1_info['drug_interactions']
        interactions1 = ast.literal_eval(interactions1_data) if isinstance(interactions1_data, str) and interactions1_data.startswith('[') else [str(interactions1_data)]
        for desc in interactions1:
            if drug2_info['drug_name'].lower() in desc.lower() or drug2_info['generic_name'].lower() in desc.lower():
                interaction_description = desc
                break
        if not interaction_description:
            interactions2_data = drug2_info['drug_interactions']
            interactions2 = ast.literal_eval(interactions2_data) if isinstance(interactions2_data, str) and interactions2_data.startswith('[') else [str(interactions2_data)]
            for desc in interactions2:
                if drug1_info['drug_name'].lower() in desc.lower() or drug1_info['generic_name'].lower() in desc.lower():
                    interaction_description = desc
                    break
    except (ValueError, SyntaxError): return 1, "Could not parse interaction data."
    
    if not interaction_description or pd.isna(interaction_description): return 0, "No interaction found."

    candidate_labels = ["high risk", "low risk"]
    result = nlp_classifier(interaction_description, candidate_labels)
    top_label = result['labels'][0]
    
    if top_label == "high risk":
        return 2, interaction_description
    else:
        return 1, interaction_description

def create_training_data(df):
    """
    Creates a training dataset where the NLP interaction check is "baked in".
    """
    print("\nCreating fully integrated training data for the ML model...")
    
    pairs = []
    for t_class in df['therapeutic_class'].unique():
        drugs_in_class = df[df['therapeutic_class'] == t_class]
        for drug_a, drug_b in product(drugs_in_class.to_dict('records'), repeat=2):
            if drug_a['drug_name'] != drug_b['drug_name']:
                pairs.append((drug_a, drug_b))

    if not pairs:
        print("❌ Could not generate any drug pairs for training.")
        return None

    training_rows = []
    for drug_a, drug_b in pairs:
        is_same_generic = 1 if drug_a['generic_name'] == drug_b['generic_name'] else 0
        is_equivalent = 1 if drug_b['therapeutic_equivalence_code'] != 'NA' else 0
        cost_difference = drug_a['pmpm_cost'] - drug_b['pmpm_cost']
        interaction_risk, _ = check_interaction_nlp(drug_a, drug_b)

        score = 0
        if is_same_generic:
            score += 50
            score += 20 * is_equivalent
            score += max(0, cost_difference)
        else:
            score -= 1000

        score -= 500 * interaction_risk

        training_rows.append({
            'drug_a_name': drug_a['drug_name'],
            'drug_b_name': drug_b['drug_name'],
            'is_same_generic': is_same_generic,
            'is_equivalent': is_equivalent,
            'cost_difference': cost_difference,
            'interaction_risk': interaction_risk,
            'alternative_score': score
        })

    training_df = pd.DataFrame(training_rows)
    print(f"✅ Created {len(training_df)} training examples with integrated safety scores.")
    return training_df


def train_ml_model(training_df):
    """
    Trains the ML model on the new, richer feature set.
    """
    print("\nTraining the integrated recommendation model...")
    
    features = ['is_same_generic', 'is_equivalent', 'cost_difference', 'interaction_risk']
    target = 'alternative_score'

    X = training_df[features]
    y = training_df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    lgb_regressor = lgb.LGBMRegressor(random_state=42)
    lgb_regressor.fit(X_train, y_train)

    predictions = lgb_regressor.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    print(f"✅ Model trained. Validation RMSE: {rmse:.2f}")
    
    return lgb_regressor


def recommend_with_ml(model, original_drugs, df):
    """
    A single function for all ML recommendations, now with new rules.
    """
    if len(original_drugs) == 1:
        original_drug = original_drugs[0]
        
        if original_drug['therapeutic_equivalence_code'] == 'NA':
            print(f"  - WARNING: The input drug '{original_drug['drug_name']}' has a TE code of 'NA'. No alternative will be recommended.")
            return None

        candidates = df[df['therapeutic_class'] == original_drug['therapeutic_class']]
        
        prediction_rows = []
        for _, candidate in candidates.iterrows():
            if original_drug['drug_name'] == candidate['drug_name']: continue
            prediction_rows.append({
                'is_same_generic': 1 if original_drug['generic_name'] == candidate['generic_name'] else 0,
                'is_equivalent': 1 if candidate['therapeutic_equivalence_code'] != 'NA' else 0,
                'cost_difference': original_drug['pmpm_cost'] - candidate['pmpm_cost'],
                'interaction_risk': 0,
                'drug_b_name': candidate['drug_name']
            })
        
        if not prediction_rows: return None
        
        prediction_df = pd.DataFrame(prediction_rows)
        features = ['is_same_generic', 'is_equivalent', 'cost_difference', 'interaction_risk']
        prediction_df['predicted_score'] = model.predict(prediction_df[features])
        best_alt_name = prediction_df.sort_values('predicted_score', ascending=False).iloc[0]['drug_b_name']
        return [df[df['drug_name'] == best_alt_name].iloc[0]]

    elif len(original_drugs) >= 2:
        drug1_orig, drug2_orig = original_drugs[0], original_drugs[1]
        
        if drug1_orig['generic_name'] == drug2_orig['generic_name'] and drug1_orig['therapeutic_class'] == drug2_orig['therapeutic_class']:
            print(f"  - WARNING: '{drug1_orig['drug_name']}' and '{drug2_orig['drug_name']}' have the same generic name and therapeutic class. They cannot be combined.")
            return None

        # --- NEW RULE: Check TE code for each input drug ---
        if drug1_orig['therapeutic_equivalence_code'] == 'NA':
            print(f"  - INFO: Input drug '{drug1_orig['drug_name']}' has TE code 'NA' and will not be replaced.")
            alts1 = pd.DataFrame([drug1_orig])
        else:
            alts1 = df[df['therapeutic_class'] == drug1_orig['therapeutic_class']]

        if drug2_orig['therapeutic_equivalence_code'] == 'NA':
            print(f"  - INFO: Input drug '{drug2_orig['drug_name']}' has TE code 'NA' and will not be replaced.")
            alts2 = pd.DataFrame([drug2_orig])
        else:
            alts2 = df[df['therapeutic_class'] == drug2_orig['therapeutic_class']]

        candidate_pairs = list(product(alts1.to_dict('records'), alts2.to_dict('records')))
        
        prediction_rows = []
        for alt1, alt2 in candidate_pairs:
            interaction_risk, _ = check_interaction_nlp(alt1, alt2)
            score1_features = pd.DataFrame([{'is_same_generic': 1 if drug1_orig['generic_name'] == alt1['generic_name'] else 0, 'is_equivalent': 1 if alt1['therapeutic_equivalence_code'] != 'NA' else 0, 'cost_difference': drug1_orig['pmpm_cost'] - alt1['pmpm_cost'], 'interaction_risk': interaction_risk}])
            score2_features = pd.DataFrame([{'is_same_generic': 1 if drug2_orig['generic_name'] == alt2['generic_name'] else 0, 'is_equivalent': 1 if alt2['therapeutic_equivalence_code'] != 'NA' else 0, 'cost_difference': drug2_orig['pmpm_cost'] - alt2['pmpm_cost'], 'interaction_risk': interaction_risk}])
            pred1 = model.predict(score1_features)[0]
            pred2 = model.predict(score2_features)[0]
            
            prediction_rows.append({'alt1': alt1, 'alt2': alt2, 'total_score': pred1 + pred2})

        if not prediction_rows: return None
        best_pair = max(prediction_rows, key=lambda x: x['total_score'])
        return [best_pair['alt1'], best_pair['alt2']]


def main():
    """
    Main function to orchestrate the new, fully ML-powered workflow.
    """
    if nlp_classifier is None: return

    filepath = "/content/testtt01.csv"
    df = load_and_clean_data(filepath)
    if df is None: return

    training_df = create_training_data(df)
    if training_df is None: return
    
    model = train_ml_model(training_df)
    
    print("\n--- Fully ML-Powered Drug Recommender ---")
    drug_input_str = input("Enter one or two drug names, separated by commas: ")
    input_drug_names = [name.strip().upper() for name in drug_input_str.split(',') if name.strip()]

    original_drugs = df[df['drug_name'].isin(input_drug_names)]
    if original_drugs.empty:
        print(f"❌ Could not find any of the entered drugs.")
        return
    
    print("\nFinding best alternative(s) using the trained ML model...")
    
    recommended_drugs = recommend_with_ml(model, original_drugs.to_dict('records'), df)
    
    if recommended_drugs is None:
        print("  - Recommendation process stopped due to data constraints.")
        return

    print("\n--- 🤖 ML Model Recommendation ---")
    if len(recommended_drugs) == 1:
        orig = original_drugs.iloc[0]
        rec = recommended_drugs[0]
        print(f"For '{orig['drug_name']}', the best alternative is:")
        print(f"  -> {rec['drug_name']} (Cost: ${rec['pmpm_cost']:.2f})")
        cost_saving = orig['pmpm_cost'] - rec['pmpm_cost']
        if cost_saving > 0:
            print(f"💰 Potential Monthly Saving per Member: ${cost_saving:.2f}")

    elif len(recommended_drugs) >= 2:
        orig1, orig2 = original_drugs.iloc[0], original_drugs.iloc[1]
        rec1, rec2 = recommended_drugs[0], recommended_drugs[1]
        print("For the combination, the best pair of alternatives is:")
        print(f"  1. {rec1['drug_name']} (Cost: ${rec1['pmpm_cost']:.2f})")
        print(f"  2. {rec2['drug_name']} (Cost: ${rec2['pmpm_cost']:.2f})")
        
        risk, desc = check_interaction_nlp(rec1, rec2)
        if risk > 0:
            print(f"⚠️ Safety Note: {desc}")
        else:
            print("✅ No interaction found for the recommended pair.")

        total_orig_cost = orig1['pmpm_cost'] + orig2['pmpm_cost']
        total_rec_cost = rec1['pmpm_cost'] + rec2['pmpm_cost']
        total_saving = total_orig_cost - total_rec_cost
        if total_saving > 0:
            print(f"💰 Total Potential Monthly Saving per Member: ${total_saving:.2f}")


if __name__ == "__main__":
    main()
