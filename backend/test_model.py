
import pickle
import numpy as np
import os

def test_kidney():
    print("\nTesting Kidney Model...")
    try:
        model = pickle.load(open("models/kidney.pkl", "rb"))
        # High risk values
        # id, age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane
        data = [0, 60, 100, 1.010, 4, 4, 0, 0, 1, 1, 300, 150, 5.0, 130, 6.0, 8.0, 25, 15000, 3.0, 1, 1, 1, 1, 1, 1]
        prediction = model.predict([np.array(data)])
        proba = model.predict_proba([np.array(data)])
        print(f"Input: {data}")
        print(f"Prediction: {prediction}")
        print(f"Probabilities: {proba}")
    except Exception as e:
        print(f"Error: {e}")

def test_liver():
    print("\nTesting Liver Model...")
    try:
        model = pickle.load(open("models/liver.pkl", "rb"))
        # High risk values
        # age, gender, total_bilirubin, direct_bilirubin, alkaline_phosphotase, alamine_aminotransferase, aspartate_aminotransferase, total_protiens, albumin, ag_ratio
        data = [50, 1, 5.0, 2.5, 500, 200, 200, 5.0, 2.0, 0.5]
        prediction = model.predict([np.array(data)])
        proba = model.predict_proba([np.array(data)])
        print(f"Input: {data}")
        print(f"Prediction: {prediction}")
        print(f"Probabilities: {proba}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kidney()
    test_liver()
