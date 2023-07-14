import json
import pandas as pd

df = pd.ExcelFile("cards.xlsx").parse('Sheet1')
df = df.reset_index()


card_num = 1
fres = {}


def mkjson(suit, rank, desc):
    global card_num
    global fres

    dict = {}
    if suit == "s" : suit = "spade"
    if suit == "h" : suit = "heart"
    if suit == "c" : suit = "club"
    if suit == "d" : suit = "diamond"

    dict["suit"] = suit
    dict["rank"] = str(rank)
    dict["desc"] = desc

    if desc != "nope" : 
        fres[f"p{card_num}"] = dict
        card_num = card_num + 1
    



for index, row in df.iterrows():
    mkjson("d", row['num'], row['D'])

for index, row in df.iterrows():
    mkjson("c", row['num'], row['C'])

for index, row in df.iterrows():
    mkjson("h", row['num'], row['H'])

for index, row in df.iterrows():
    mkjson("s", row['num'], row['S'])

print("added " + str(card_num - 1))
with open('pai.json', 'w', encoding='utf8') as json_file:
    json.dump(fres, json_file, ensure_ascii=False ,indent=2)








