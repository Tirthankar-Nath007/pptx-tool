import pandas as pd
import io
from openpyxl import load_workbook

# Path to the test Excel file
file_path = 'project-update-template.xlsx'

# Read Excel file with pandas
df = pd.read_excel(file_path, header=None)

print("DataFrame contents:")
print(df)
print("\nHeaders (row 2):")
print(df.iloc[1])
print("\nData rows:")
print(df.iloc[2:])
print("\nData types:")
print(df.dtypes)

# Test normalize_cell
def normalize_cell(cell):
    if isinstance(cell, (pd.Timestamp, pd.Timestamp)):
        return cell.strftime("%d/%m/%Y")
    return str(cell).strip()

print("\nNormalized data:")
for index, row in df.iloc[2:].iterrows():
    normalized_row = [normalize_cell(cell) for cell in row]
    print(f"Row {index+1}: {normalized_row}")
    print(f"Dev effort value: '{normalized_row[3]}' (length: {len(normalized_row[3])})")