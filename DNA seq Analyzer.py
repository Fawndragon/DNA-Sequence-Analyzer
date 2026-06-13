#TOOL FOR RESTRICTION ENZYME

#TOOL FOR RESTRICTION ENZYME

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DNAInput(BaseModel):
    sequence: str
    restriction_site: str

@app.post("/api/analyze")
def analyze_dna(data: DNAInput):
    a = data.sequence.upper().strip()
    restriction_site = data.restriction_site.upper().strip()

    if not a:
        return {"error": "Empty sequence"}

    countG = 0
    countC = 0
    countT = 0
    countA = 0
    complement = ""
    fragment = []

    for i in a:
        if i == "A":
            countA += 1
        if i == "T":
            countT += 1
        if i == "G":
            countG += 1
        if i == "C":
            countC += 1

    fragment = a.split(restriction_site)
    site_count = a.count(restriction_site)

    y = countG / len(a) * 100
    z = countC / len(a) * 100
    t = countT / len(a) * 100
    b = countA / len(a) * 100

    x = countG + countC
    total = x / len(a) * 100

    for i in a:
        if i == "A":
            complement += "T"
        elif i == "C":
            complement += "G"
        elif i == "T":
            complement += "A"
        elif i == "G":
            complement += "C"
    reverse = complement[::-1]

    return {
        "sequence_length": len(a),
        "fragments": fragment,
        "site_count": site_count,
        "gc_percent": round(total, 2),
        "complementary_strand": reverse,
        "base_composition": {
            "A": {"count": countA, "percentage": round(b, 2)},
            "T": {"count": countT, "percentage": round(t, 2)},
            "G": {"count": countG, "percentage": round(y, 2)},
            "C": {"count": countC, "percentage": round(z, 2)}
        }
    }
            

        
