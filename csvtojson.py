import pandas as pd

df = pd.read_csv("accidents_filtered.csv")
df.to_json("accidents_filtered.json", orient="records")