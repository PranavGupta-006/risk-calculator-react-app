import sys
import pandas as pd
import matplotlib.pyplot as plt

print("Risk Management Indicator Tool")

data = pd.read_csv("1.csv")
num_entries = len(data)

count1 = 0
count2 = 0
count3 = 0
count4 = 0
count5 = 0

user = input("Enter User ID  or punch ALL for all users: ").strip().upper()

if user == "ALL":
    print("You selected ALL USERS mode")
    print("\nAnalyzing ALL users...\n")
    
    results = []
    for index, row in data.iterrows():

        user = row["user_id"]

        print("user_id : ",user)
        print("\nExpense Ratio")

        monthly_expense = int(data[data["user_id"] == user]["monthly_expenses"].iloc[0])
        monthly_income = int(data[data["user_id"] == user]["monthly_income"].iloc[0])

        expense_ratio = monthly_expense / monthly_income
        print("Expense Ratio :", expense_ratio)

        if expense_ratio < 0.5:
            expense_risk = "LOW"
        elif expense_ratio <= 0.75:
            expense_risk = "MODERATE"
        else:
            expense_risk = "HIGH"

        print("Expense Risk :", expense_risk)

        print("\nDebt-to-Income Ratio")

        monthly_debt = int(data[data["user_id"] == user]["monthly_debt"].iloc[0])
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

        print("\nEmergency Fund Coverage")

        emergency_fund = int(data[data["user_id"] == user]["emergency_fund"].iloc[0])
        emergency_coverage = emergency_fund / monthly_expense

        print("Emergency Months :", emergency_coverage)

        if emergency_coverage <= 3:
            emergency_risk = "HIGH"
        elif emergency_coverage < 6:
            emergency_risk = "MODERATE"
        else:
            emergency_risk = "LOW"

        print("Emergency Risk :", emergency_risk)

        print("\nSavings Adequacy")

        total_savings = int(data[data["user_id"] == user]["total_savings"].iloc[0])
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

        overall_risk = (expense_ratio * 0.30 + dti * 0.25 + emergency_coverage * 0.25 + savings_ratio * 0.20)

        print("\nOverall Potfolio Risk")
        print("Overall Risk : ",overall_risk)

        if overall_risk >= 4.0:
            overall_risk_score = "HIGH"
            count1 = count1 + 1
        elif overall_risk >= 3.0:
            overall_risk_score = "MEDIUM-HIGH"
            count2 = count2 + 1
        elif overall_risk >= 2.0:
            overall_risk_score = "MEDIUM"
            count3 = count3 + 1
        elif overall_risk >= 1.5:
            overall_risk_score = "LOW"
            count4 = count4 + 1
        else:
            overall_risk_score = "VERY LOW"
            count5 = count5 + 1

        print("Overall Risk to Potfolio : ", overall_risk_score)
        print("------------------------------------------------")

        results.append({"UID": user,"Overall Risk": overall_risk_score})

    print("\nStatistics : ")
    print("HIGH RISK : ",count1)
    print("MEDIUM-HIGH RISK : ",count2)
    print("MEDIUM RISK : ",count3)
    print("LOW RISK : ",count4)
    print("VERY LOW RISK : ",count5)
    
    p = [count1, count2, count3, count4, count5]
    l = ["HIGH RISK", "MEDIUM-HIGH RISK", "MEDIUM RISK", "LOW RISK", "VERY LOW RISK"]

    plt.pie(p, labels=l)
    plt.show()

    print("\nBatch analysis completed for", len(results), "users")
    choice = input("Do you want to export as CSV?").strip().upper()

    if choice == "YES":
        exp = pd.DataFrame(results)
        exp.to_csv("Report.csv", index=False)
        print("CSV Sucesfully Exported")

    else:
        sys.exit(0)
        print("Thank you for using this tool")

else:
    numbers = ""
    for ch in user:
        if ch.isdigit():
            numbers += ch

    if numbers == "":
        print("Invalid input: no numeric ID found")
        sys.exit(1)

    user_number = int(numbers)

    if user_number < 1 or user_number > num_entries:
        print(f"Invalid user number: {user_number}")
        print(f"Valid range: 1 to {num_entries}")
        sys.exit(1)    
    
    print("\nYou selected SINGLE USER mode")
    print("User selected:", user)

    print("\nExpense Ratio")

    monthly_expense = int(data[data["user_id"] == user]["monthly_expenses"].iloc[0])
    monthly_income = int(data[data["user_id"] == user]["monthly_income"].iloc[0])

    expense_ratio = monthly_expense / monthly_income
    print("Expense Ratio:", expense_ratio)

    if expense_ratio < 0.5:
        expense_risk = "LOW"
    elif expense_ratio <= 0.75:
        expense_risk = "MODERATE"
    else:
        expense_risk = "HIGH"

    print("Expense Risk :", expense_risk)

    print("\nDebt-to-Income Ratio")

    monthly_debt = int(data[data["user_id"] == user]["monthly_debt"].iloc[0])
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

    print("\nEmergency Fund Coverage")

    emergency_fund = int(data[data["user_id"] == user]["emergency_fund"].iloc[0])
    emergency_coverage = emergency_fund / monthly_expense

    print("Emergency Months :", emergency_coverage)

    if emergency_coverage <= 3:
        emergency_risk = "HIGH"
    elif emergency_coverage < 6:
        emergency_risk = "MODERATE"
    else:
        emergency_risk = "LOW"

    print("Emergency Risk :", emergency_risk)

    print("\nSavings Adequacy")

    total_savings = int(data[data["user_id"] == user]["total_savings"].iloc[0])
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

    overall_risk = (expense_ratio * 0.30 + dti * 0.25 + emergency_coverage * 0.25 + savings_ratio * 0.20)

    print("\nOverall Potfolio Risk")
    print("Overall Risk : ",overall_risk)

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

    print("Overall Risk to Potfolio : ", overall_risk_score)

    s = [40, 25, 20, 15]
    l = ["Analyst", "Consultant", "Manager", "Intern"]

    plt.pie(s, labels=l)
    plt.show()