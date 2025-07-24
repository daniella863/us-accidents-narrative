import pandas as pd

# Load the dataset
df = pd.read_csv("data/USA_ACCIDENTS.csv", low_memory=False)

# Convert Start_Time to datetime
df["Start_Time"] = pd.to_datetime(df["Start_Time"], errors='coerce')

# Filter by the last 5 years (2019 and later)
df = df[df["Start_Time"].dt.year >= 2013]

# Select only the available columns
columns_to_keep = [
    "ID", "Start_Time", "Start_Lat", "Start_Lng",
    "City", "State", "Temperature(F)"
]

df_filtered = df[columns_to_keep]

# Optional: remove rows with missing values
df_filtered = df_filtered.dropna()

# Optional: sample down to 50,000 rows for performance
#df_sampled = df_filtered.sample(n=50000, random_state=42)

# Save to new CSV
df_filtered.to_csv("data/accidents_filtered.csv", index=False)

print("✅ Saved: data/accidents_filtered.csv")