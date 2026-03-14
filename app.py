import sys
import pandas as pd
import matplotlib.pyplot as plt

print("Risk Management Indicator Tool")

data = pd.read_csv("1.csv")


def calculate_user_risk(user_id):

    row = data[data["user_id"] == user_id].iloc[0]

    monthly_income = int(row["monthly_income"])
    monthly_expense = int(row["monthly_expenses"])
    monthly_debt = int(row["monthly_debt"])
    emergency_fund = int(row["emergency_fund"])
    total_savings = int(row["total_savings"])

    print("user_id :", user_id)

    # Expense Ratio
    print("\nExpense Ratio")

    expense_ratio = monthly_expense / monthly_income
    print("Expense Ratio :", expense_ratio)

    if expense_ratio < 0.5:
        expense_risk = "LOW"
    elif expense_ratio <= 0.75:
        expense_risk = "MODERATE"
    else:
        expense_risk = "HIGH"

    print("Expense Risk :", expense_risk)

    # DTI
    print("\nDebt-to-Income Ratio")

    dti = (monthly_debt / monthly_income) * 100
    print("DTI (%):", dti)

    if dti <= 36:
        dti_risk = "VERY LOW"
    elif dti <= 43:
        dti_risk = "LOW"
    elif dti <= 50:
        dti_risk = "HIGH"
    else:
        dti_risk = "VERY HIGH"

    print("DTI Risk :", dti_risk)

    # Emergency Fund
    print("\nEmergency Fund Coverage")

    emergency_coverage = emergency_fund / monthly_expense
    print("Emergency Months :", emergency_coverage)

    if emergency_coverage <= 3:
        emergency_risk = "HIGH"
    elif emergency_coverage < 6:
        emergency_risk = "MODERATE"
    else:
        emergency_risk = "LOW"

    print("Emergency Risk :", emergency_risk)

    # Savings
    print("\nSavings Adequacy")

    savings_ratio = total_savings / (12 * monthly_income)
    print("Savings Ratio :", savings_ratio)

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

    print("Savings Risk :", savings_risk)

    # Overall Risk
    overall_risk = (
        expense_ratio * 0.30
        + dti * 0.25
        + emergency_coverage * 0.25
        + savings_ratio * 0.20
    )

    print("\nOverall Portfolio Risk")
    print("Overall Risk :", overall_risk)

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

    print("Overall Risk to Portfolio :", overall_risk_score)
    print("------------------------------------------")

    return overall_risk_score


def analyze_all_users():

    print("You selected ALL USERS mode")
    print("\nAnalyzing ALL users...\n")

    results = []

    count1 = count2 = count3 = count4 = count5 = 0

    for _, row in data.iterrows():

        user = row["user_id"]

        risk = calculate_user_risk(user)

        if risk == "HIGH":
            count1 += 1
        elif risk == "MEDIUM-HIGH":
            count2 += 1
        elif risk == "MEDIUM":
            count3 += 1
        elif risk == "LOW":
            count4 += 1
        else:
            count5 += 1

        results.append({"UID": user, "Overall Risk": risk})

    print("\nStatistics")
    print("HIGH RISK :", count1)
    print("MEDIUM-HIGH RISK :", count2)
    print("MEDIUM RISK :", count3)
    print("LOW RISK :", count4)
    print("VERY LOW RISK :", count5)

    p = [count1, count2, count3, count4, count5]
    l = ["HIGH", "MEDIUM-HIGH", "MEDIUM", "LOW", "VERY LOW"]

    plt.pie(p, labels=l)
    plt.show()

    print("\nBatch analysis completed for", len(results), "users")

    choice = input("Do you want to export as CSV? ").strip().upper()

    if choice == "YES":
        pd.DataFrame(results).to_csv("Report.csv", index=False)
        print("CSV Successfully Exported")


def analyze_single_user(user):

    print("\nYou selected SINGLE USER mode")
    print("User selected:", user)

    calculate_user_risk(user)

    s = [40, 25, 20, 15]
    l = ["Analyst", "Consultant", "Manager", "Intern"]

    plt.pie(s, labels=l)
    plt.show()


# MAIN PROGRAM

user = input("Enter User ID or punch ALL for all users: ").strip().upper()

if user == "ALL":
    analyze_all_users()

else:
    analyze_single_user(user)