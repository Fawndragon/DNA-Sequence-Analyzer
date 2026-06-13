# ==============================================================================
# Project: DNA Sequence Analysis Suite
# Author: S.B.Taanushri (Fawndragon)
# License: MIT License (c) 2026
# Description: Dynamic bioinformatics tool for restriction simulation, 
#              GC content tracking, and reverse complement generation.
# ==============================================================================

#TOOL FOR RESTRICTION ENZYME
a=input("Enter the DNA sequence: ")
countG=0
countC=0
complement=""
fragment=[]
restriction_site=input("Enter the restriction enzyme site:")
for i in a:
    if i=="G":
        countG+=1
    if i=="C":
        countC+=1     
    fragment=a.split(restriction_site)
    site_count=a.count(restriction_site)
    x=countG+countC
    total=x/len(a)*100
    if i=="A":
        complement+="T"
    elif i=="C":
        complement+="G"
    elif i=="T":
        complement+="A"
    elif i=="G":
        complement+="C"
    reverse=complement[::-1]
print("restriction_site:",restriction_site) 
print("DNA seq without restriction site:", fragment)
print("GC:", x)
print ("Total Percentage:", total, "%")
print("site_count: ",site_count)
print("Complementary of the DNA cut by restriction enzyme:", reverse)
        

        
