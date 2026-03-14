from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Risk Management Indicator API")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data = pd.read_csv("1.csv")


def calculate_user_risk(user_id):

    row = data[data["user_id"] == user_id].iloc[0]

    monthly_income = int(row["monthly_income"])
    monthly_expense = int(row["monthly_expenses"])
    monthly_debt = int(row["monthly_debt"])
    emergency_fund = int(row["emergency_fund"])
    total_savings = int(row["total_savings"])

    expense_ratio = monthly_expense / monthly_income

    if expense_ratio < 0.5:
        expense_risk = "LOW"
    elif expense_ratio <= 0.75:
        expense_risk = "MODERATE"
    else:
        expense_risk = "HIGH"

    dti = (monthly_debt / monthly_income) * 100

    if dti <= 36:
        dti_risk = "VERY LOW"
    elif dti <= 43:
        dti_risk = "LOW"
    elif dti <= 50:
        dti_risk = "HIGH"
    else:
        dti_risk = "VERY HIGH"

    emergency_coverage = emergency_fund / monthly_expense

    if emergency_coverage <= 3:
        emergency_risk = "HIGH"
    elif emergency_coverage < 6:
        emergency_risk = "MODERATE"
    else:
        emergency_risk = "LOW"

    savings_ratio = total_savings / (12 * monthly_income)

    if savings_ratio < 0.25:
        savings_risk = "VERY HIGH"
    elif savings_ratio < 0.5:
        savings_risk = "HIGH"
    elif savings_ratio < 1.0:
        savings_risk = "MODERATE"
    elif savings_ratio < 2.0:
        savings_risk = "LOW"
    else:
        savings_risk = "VERY LOW"

    overall_risk = (
        expense_ratio * 0.30
        + dti * 0.25
        + emergency_coverage * 0.25
        + savings_ratio * 0.20
    )

    if overall_risk >= 4.0:
        overall_risk_score = "HIGH"
    elif overall_risk >= 3.0:
        overall_risk_score = "MEDIUM-HIGH"
    elif overall_risk >= 2.0:
        overall_risk_score = "MEDIUM"
    elif overall_risk >= 1.5:
        overall_risk_score = "LOW"
    else:
        overall_risk_score = "VERY LOW"

    return {
        "user_id": user_id,
        "expense_ratio": expense_ratio,
        "expense_risk": expense_risk,
        "dti": dti,
        "dti_risk": dti_risk,
        "emergency_coverage": emergency_coverage,
        "emergency_risk": emergency_risk,
        "savings_ratio": savings_ratio,
        "savings_risk": savings_risk,
        "overall_risk_value": overall_risk,
        "overall_risk": overall_risk_score
    }


def analyze_all_users():

    results = []

    counts = {
        "HIGH": 0,
        "MEDIUM-HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
        "VERY LOW": 0
    }

    for _, row in data.iterrows():

        user = row["user_id"]

        risk_data = calculate_user_risk(user)

        risk = risk_data["overall_risk"]

        counts[risk] += 1

        results.append(risk_data)

    return {
        "total_users": len(results),
        "risk_distribution": counts,
        "users": results
    }


def analyze_single_user(user):

    return calculate_user_risk(user)

@app.get("/risk/{user_id}")
def get_user_risk(user_id: str):
    return analyze_single_user(user_id)


@app.get("/risk")
def get_all_risk():
    return analyze_all_users()