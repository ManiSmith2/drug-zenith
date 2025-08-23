from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import ast
import warnings
from itertools import product
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import your ML model
from app import (
    load_and_clean_data, 
    create_training_data, 
    train_ml_model, 
    recommend_with_ml,
    check_interaction_nlp,
    nlp_classifier
)

app = Flask(__name__)
CORS(app)

# Global variables to store model and data
model = None
df = None

def initialize_model():
    """Initialize the ML model and load data"""
    global model, df
    try:
        # Load and clean data
        filepath = "data/testtt01.csv"
        df = load_and_clean_data(filepath)
        if df is None:
            print("❌ Failed to load dataset")
            return False
        
        # Create training data and train model
        training_df = create_training_data(df)
        if training_df is None:
            print("❌ Failed to create training data")
            return False
        
        model = train_ml_model(training_df)
        print("✅ Model initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'data_loaded': df is not None,
        'nlp_available': nlp_classifier is not None
    })

@app.route('/api/drugs', methods=['GET'])
def get_drugs():
    """Get all drugs from the dataset"""
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    try:
        # Convert DataFrame to list of dictionaries
        drugs_list = df.to_dict('records')
        
        # Clean up the data for frontend
        for drug in drugs_list:
            for key, value in drug.items():
                if pd.isna(value):
                    drug[key] = None
                elif isinstance(value, (np.integer, np.floating)):
                    drug[key] = float(value) if not np.isnan(value) else None
        
        return jsonify({
            'drugs': drugs_list,
            'total_count': len(drugs_list)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drug-stats', methods=['GET'])
def get_drug_stats():
    """Get statistical overview of the drug dataset"""
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    try:
        stats = {
            'total_drugs': len(df),
            'total_cost': float(df['total_drug_cost'].sum()) if 'total_drug_cost' in df.columns else 0,
            'total_members': int(df['member_count'].sum()) if 'member_count' in df.columns else 0,
            'avg_pmpm': float(df['pmpm_cost'].mean()) if 'pmmp_cost' in df.columns else 0,
            'therapeutic_classes': df['therapeutic_class'].nunique() if 'therapeutic_class' in df.columns else 0,
            'states_covered': df['state'].nunique() if 'state' in df.columns else 0,
            'avg_age': float(df['avg_age'].mean()) if 'avg_age' in df.columns else 0,
            'te_codes_distribution': df['therapeutic_equivalence_code'].value_counts().to_dict() if 'therapeutic_equivalence_code' in df.columns else {}
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """Get ML-powered drug recommendations"""
    if model is None or df is None:
        return jsonify({'error': 'Model or dataset not loaded'}), 500
    
    try:
        data = request.get_json()
        drug_names = data.get('drug_names', [])
        
        if not drug_names:
            return jsonify({'error': 'No drug names provided'}), 400
        
        # Convert to uppercase to match dataset format
        drug_names = [name.strip().upper() for name in drug_names]
        
        # Find original drugs in dataset
        original_drugs = df[df['drug_name'].isin(drug_names)]
        if original_drugs.empty:
            return jsonify({'error': 'None of the provided drugs found in dataset'}), 404
        
        # Get recommendations using ML model
        recommended_drugs = recommend_with_ml(model, original_drugs.to_dict('records'), df)
        
        if recommended_drugs is None:
            return jsonify({
                'error': 'No recommendations could be generated',
                'original_drugs': original_drugs.to_dict('records')
            }), 200
        
        # Calculate cost savings and interaction analysis
        result = {
            'original_drugs': original_drugs.to_dict('records'),
            'recommended_drugs': recommended_drugs,
            'analysis': {}
        }
        
        # Single drug recommendation analysis
        if len(recommended_drugs) == 1 and len(original_drugs) == 1:
            orig = original_drugs.iloc[0]
            rec = recommended_drugs[0]
            cost_saving = float(orig['pmpm_cost'] - rec['pmpm_cost'])
            
            result['analysis'] = {
                'type': 'single_drug',
                'cost_saving_per_member': cost_saving,
                'percentage_saving': (cost_saving / orig['pmpm_cost']) * 100 if orig['pmpm_cost'] > 0 else 0,
                'therapeutic_class_match': orig['therapeutic_class'] == rec['therapeutic_class'],
                'generic_match': orig['generic_name'] == rec['generic_name']
            }
        
        # Multiple drug combination analysis
        elif len(recommended_drugs) >= 2 and len(original_drugs) >= 2:
            orig1, orig2 = original_drugs.iloc[0], original_drugs.iloc[1]
            rec1, rec2 = recommended_drugs[0], recommended_drugs[1]
            
            total_orig_cost = float(orig1['pmmp_cost'] + orig2['pmpm_cost'])
            total_rec_cost = float(rec1['pmpm_cost'] + rec2['pmpm_cost'])
            total_saving = total_orig_cost - total_rec_cost
            
            # Check for drug interactions
            interaction_risk, interaction_desc = check_interaction_nlp(rec1, rec2)
            
            result['analysis'] = {
                'type': 'combination',
                'total_cost_saving': total_saving,
                'percentage_saving': (total_saving / total_orig_cost) * 100 if total_orig_cost > 0 else 0,
                'interaction_risk': interaction_risk,
                'interaction_description': interaction_desc,
                'safety_score': 'High' if interaction_risk == 0 else 'Medium' if interaction_risk == 1 else 'Low'
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/therapeutic-classes', methods=['GET'])
def get_therapeutic_classes():
    """Get all therapeutic classes with drug counts"""
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    try:
        class_counts = df['therapeutic_class'].value_counts().to_dict()
        classes = [{'name': name, 'count': count} for name, count in class_counts.items()]
        return jsonify({'therapeutic_classes': classes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cost-analysis', methods=['GET'])
def get_cost_analysis():
    """Get cost analysis data for visualization"""
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    try:
        # Cost by therapeutic class
        cost_by_class = df.groupby('therapeutic_class')['total_drug_cost'].sum().to_dict()
        
        # PMPM trends by state
        pmpm_by_state = df.groupby('state')['pmpm_cost'].mean().to_dict()
        
        # Age distribution analysis
        age_bins = pd.cut(df['avg_age'], bins=[0, 30, 50, 65, 100], labels=['<30', '30-50', '50-65', '65+'])
        age_distribution = age_bins.value_counts().to_dict()
        
        return jsonify({
            'cost_by_therapeutic_class': cost_by_class,
            'pmpm_by_state': pmpm_by_state,
            'age_distribution': {str(k): v for k, v in age_distribution.items()}
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/add-drug', methods=['POST'])
def add_drug():
    """Add a new drug to the dataset"""
    global df
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['ndc', 'drug_name', 'generic_name', 'therapeutic_class', 'pmpm_cost']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new drug entry
        new_drug = pd.DataFrame([data])
        df = pd.concat([df, new_drug], ignore_index=True)
        
        return jsonify({'message': 'Drug added successfully', 'drug': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting PBM ML Server...")
    if initialize_model():
        print("✅ Server ready!")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to initialize server")