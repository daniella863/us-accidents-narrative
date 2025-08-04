import pandas as pd

# Load the dataset
df = pd.read_csv("data/USA_ACCIDENTS.csv", low_memory=False)

# Keep only relevant columns
columns_to_keep = ['ID', 'Start_Time', "Start_Lat", "Start_Lng", 'City', 'State', 'Temperature(F)']
df = df[columns_to_keep]

# Drop rows with missing values
df.dropna(subset=['Start_Time', 'State', 'Temperature(F)'], inplace=True)

# Filter to Southwest states
southwest_states = ['AZ', 'NM', 'TX', 'OK', 'NV', 'UT', 'CO', 'CA']
df = df[df['State'].isin(southwest_states)]

# Filter to dates from 2018 onward
df = df[df['Start_Time'].str[:4].isin(['2018', '2019', '2020', '2021', '2022', '2023'])]

# Clean up Weather_Condition formatting
df['Temperature(F)'] = df['Temperature(F)'].round(-1) 

# Save cleaned and filtered dataset
df.to_csv("data/accidents_filtered.csv", index=False)

print("Cleaned and filtered dataset saved as 'accidents_southwest_2018.csv'")