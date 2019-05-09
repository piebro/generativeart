Data from the Google quickdraw dataset
quickdraw_data5.js for example contains an Object 5 examples of each categorie of the quickdraw dataset that were guessed right. The Object Structure is: quickdraw_data5[categorie] = "list of drawings of that categorie"

to download the original Dataset from Google:
1. install Google Cloud SDK Shell
2. gsutil cp -r gs://quickdraw_dataset/full/simplified .

to create quickdraw_data5:
python3 saveAndReduceQuickdrawData.py 5 path-to-quickdraw-ndjsons
