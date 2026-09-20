/**
 * The MedBase knowledge base: the learning-facing record for a condition.
 *
 * This is the layer students read and the layer the Lab draws from. A condition is simulable
 * only when it carries a `labModel` binding, and the Lab builds its condition list from those
 * bindings — so a record without one cannot quietly be "modelled anyway".
 */
export interface Disease {
    id: string;
    name: string;
    category: string;
    description: string;
    causes: string[];
    riskFactors: string[];
    prevention: string[];
    treatment: string[];
    sources: {
        name: string;
        url: string;
    }[];
    keywords: string[];
    labModel?: {
        /** The only implemented model today; lives in src/sim. */
        id: "t2d-progression";
        label: string;
        /** What the model covers out of everything this record describes. */
        scope: string;
    };
}

export const diseases: Disease[] = [
    {
        id: "diabetes",
        name: "Diabetes Mellitus",
        category: "Metabolic",
        description: "A chronic condition where the body cannot properly process blood glucose (sugar). There are two main types: Type 1 (body doesn't produce insulin) and Type 2 (body doesn't use insulin properly).",
        causes: [
            "Type 1: Autoimmune destruction of insulin-producing cells",
            "Type 2: Insulin resistance combined with inadequate insulin production",
            "Genetic factors",
            "Environmental triggers"
        ],
        riskFactors: [
            "Family history of diabetes",
            "Obesity or overweight",
            "Physical inactivity",
            "Age over 45 years",
            "High blood pressure",
            "Unhealthy diet"
        ],
        prevention: [
            "Maintain a healthy weight",
            "Exercise regularly (at least 30 minutes daily)",
            "Eat a balanced diet rich in fiber",
            "Limit sugar and refined carbohydrates",
            "Regular health check-ups",
            "Avoid smoking and excessive alcohol"
        ],
        treatment: [
            "Lifestyle modifications (diet and exercise)",
            "Blood glucose monitoring",
            "Oral medications (for Type 2)",
            "Insulin therapy (for Type 1 and some Type 2)",
            "Regular medical supervision"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/diabetes" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/diabetes.html" },
            { name: "ICMR", url: "https://icmr.gov.in" },
            { name: "Gov UK", url: "https://www.gov.uk/health-and-social-care" },
            { name: "TGA", url: "https://www.tga.gov.au" }
        ],
        keywords: ["diabetes", "blood sugar", "insulin", "type 1", "type 2", "glucose"],
        labModel: {
            id: "t2d-progression",
            label: "Type 2 diabetes progression",
            scope: "Type 2 only, and only the glycaemic pathway: HbA1c drift over time and the microvascular and myocardial infarction hazard that follows from it. Type 1, acute complications, and everything else on this page are outside the model."
        }
    },
    {
        id: "hypertension",
        name: "Hypertension (High Blood Pressure)",
        category: "Cardiovascular",
        description: "A condition where blood pressure in the arteries is persistently elevated. Often called the 'silent killer' because it usually has no symptoms but can lead to serious complications.",
        causes: [
            "Primary hypertension: No identifiable cause, develops gradually",
            "Secondary hypertension: Caused by underlying conditions",
            "Kidney disease",
            "Hormonal disorders",
            "Certain medications"
        ],
        riskFactors: [
            "Age (risk increases with age)",
            "Family history",
            "Being overweight or obese",
            "Lack of physical activity",
            "High salt diet",
            "Excessive alcohol consumption",
            "Stress"
        ],
        prevention: [
            "Reduce salt intake (less than 5g/day)",
            "Eat more fruits and vegetables",
            "Exercise regularly",
            "Maintain healthy weight",
            "Limit alcohol consumption",
            "Manage stress",
            "Avoid tobacco use"
        ],
        treatment: [
            "Lifestyle modifications",
            "Antihypertensive medications",
            "Regular blood pressure monitoring",
            "Treatment of underlying conditions",
            "Dietary changes (DASH diet)"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/hypertension" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/highbloodpressure.html" }
        ],
        keywords: ["hypertension", "high blood pressure", "bp", "cardiovascular"]
    },
    {
        id: "dengue",
        name: "Dengue Fever",
        category: "Infectious",
        description: "A mosquito-borne viral infection causing flu-like illness. In severe cases, it can develop into dengue hemorrhagic fever, which can be life-threatening.",
        causes: [
            "Dengue virus (DENV) - four serotypes",
            "Transmitted by Aedes mosquitoes (mainly Aedes aegypti)",
            "Mosquito bites during daytime",
            "Urban and semi-urban areas"
        ],
        riskFactors: [
            "Living in tropical/subtropical regions",
            "Previous dengue infection",
            "Rainy season",
            "Stagnant water near living areas",
            "Lack of mosquito control measures"
        ],
        prevention: [
            "Eliminate mosquito breeding sites",
            "Use mosquito repellents",
            "Wear long-sleeved clothing",
            "Use mosquito nets and screens",
            "Keep water containers covered",
            "Community mosquito control programs"
        ],
        treatment: [
            "No specific antiviral treatment",
            "Rest and hydration",
            "Paracetamol for fever and pain",
            "Avoid aspirin and NSAIDs",
            "Monitor for warning signs",
            "Hospital care for severe cases"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/dengue.html" },
            { name: "ICMR", url: "https://icmr.gov.in" }
        ],
        keywords: ["dengue", "mosquito", "fever", "aedes", "viral"]
    },
    {
        id: "malaria",
        name: "Malaria",
        category: "Infectious",
        description: "A life-threatening disease caused by parasites transmitted through infected female Anopheles mosquito bites. It is preventable and curable with early treatment.",
        causes: [
            "Plasmodium parasites (P. falciparum most dangerous)",
            "Female Anopheles mosquito bites",
            "Blood transfusion (rare)",
            "Mother to child during pregnancy"
        ],
        riskFactors: [
            "Living in or traveling to endemic areas",
            "Lack of preventive measures",
            "Young children and pregnant women",
            "Poor access to healthcare",
            "Drug-resistant malaria regions"
        ],
        prevention: [
            "Sleep under insecticide-treated nets",
            "Use mosquito repellents",
            "Indoor residual spraying",
            "Antimalarial medications for travelers",
            "Eliminate mosquito breeding sites",
            "Early diagnosis and treatment"
        ],
        treatment: [
            "Artemisinin-based combination therapies (ACTs)",
            "Early diagnosis essential",
            "Complete the full course of treatment",
            "Supportive care for severe cases",
            "Hospital admission for complicated malaria"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/malaria" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/malaria.html" },
            { name: "NVBDCP", url: "https://nvbdcp.gov.in" }
        ],
        keywords: ["malaria", "mosquito", "plasmodium", "fever", "anopheles"]
    },
    {
        id: "covid-19",
        name: "COVID-19",
        category: "Infectious",
        description: "An infectious disease caused by the SARS-CoV-2 virus. Most people experience mild to moderate respiratory illness and recover without special treatment.",
        causes: [
            "SARS-CoV-2 virus",
            "Spread through respiratory droplets",
            "Close contact with infected persons",
            "Airborne transmission in enclosed spaces"
        ],
        riskFactors: [
            "Close contact with infected persons",
            "Older age",
            "Underlying health conditions",
            "Weakened immune system",
            "Unvaccinated status"
        ],
        prevention: [
            "Get vaccinated",
            "Wear masks in crowded spaces",
            "Maintain physical distancing",
            "Practice hand hygiene",
            "Ensure good ventilation",
            "Stay home when sick"
        ],
        treatment: [
            "Rest and hydration for mild cases",
            "Symptomatic treatment",
            "Antiviral medications for high-risk patients",
            "Oxygen therapy for severe cases",
            "Hospital care for critical cases"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/health-topics/coronavirus" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/covid19coronavirusdisease2019.html" },
            { name: "MoHFW India", url: "https://www.mohfw.gov.in" },
            { name: "Gov UK - COVID-19", url: "https://www.gov.uk/coronavirus" },
            { name: "TGA - COVID-19", url: "https://www.tga.gov.au/products/covid-19" }
        ],
        keywords: ["covid", "coronavirus", "sars-cov-2", "pandemic", "respiratory"]
    },
    {
        id: "tuberculosis",
        name: "Tuberculosis (TB)",
        category: "Infectious",
        description: "A bacterial infection that mainly affects the lungs. TB spreads through the air when infected people cough, sneeze, or spit. It is curable and preventable.",
        causes: [
            "Mycobacterium tuberculosis bacteria",
            "Airborne transmission",
            "Prolonged close contact with infected person",
            "Latent TB can become active"
        ],
        riskFactors: [
            "HIV/AIDS",
            "Weakened immune system",
            "Close contact with TB patients",
            "Malnutrition",
            "Diabetes",
            "Living in crowded conditions"
        ],
        prevention: [
            "BCG vaccination for children",
            "Good ventilation in living spaces",
            "Early detection and treatment",
            "Complete the full treatment course",
            "Infection control in healthcare settings"
        ],
        treatment: [
            "6-month course of antibiotics",
            "Directly Observed Treatment (DOTS)",
            "Regular follow-up and testing",
            "Drug-resistant TB requires longer treatment",
            "Nutritional support"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/tuberculosis" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/tuberculosis.html" },
            { name: "RNTCP India", url: "https://tbcindia.gov.in" }
        ],
        keywords: ["tuberculosis", "tb", "lung infection", "bacterial", "dots"]
    },
    {
        id: "typhoid",
        name: "Typhoid Fever",
        category: "Infectious",
        description: "A bacterial infection caused by Salmonella typhi. It spreads through contaminated food and water. Typhoid is common in areas with poor sanitation.",
        causes: [
            "Salmonella typhi bacteria",
            "Contaminated food or water",
            "Poor sanitation and hygiene",
            "Contact with infected persons"
        ],
        riskFactors: [
            "Traveling to endemic areas",
            "Poor access to clean water",
            "Inadequate sanitation",
            "Contact with typhoid carriers",
            "Eating street food"
        ],
        prevention: [
            "Drink safe, treated water",
            "Proper food hygiene",
            "Wash hands frequently",
            "Get vaccinated before traveling",
            "Avoid raw foods in endemic areas"
        ],
        treatment: [
            "Antibiotic therapy",
            "Adequate hydration",
            "Rest",
            "Hospitalization for severe cases",
            "Complete the antibiotic course"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/typhoid" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/typhoidfever.html" }
        ],
        keywords: ["typhoid", "salmonella", "fever", "water-borne", "food poisoning"]
    },
    {
        id: "cholera",
        name: "Cholera",
        category: "Infectious",
        description: "An acute diarrheal infection caused by ingesting contaminated food or water. It can be rapidly fatal if untreated but is easily treatable with oral rehydration.",
        causes: [
            "Vibrio cholerae bacteria",
            "Contaminated water",
            "Contaminated food",
            "Poor sanitation"
        ],
        riskFactors: [
            "Lack of clean water access",
            "Poor sanitation",
            "Living in crowded conditions",
            "Natural disasters or emergencies",
            "Consuming raw seafood"
        ],
        prevention: [
            "Safe drinking water",
            "Proper sanitation",
            "Hand washing with soap",
            "Safe food preparation",
            "Oral cholera vaccines in endemic areas"
        ],
        treatment: [
            "Oral Rehydration Solution (ORS)",
            "Intravenous fluids for severe dehydration",
            "Antibiotics in severe cases",
            "Zinc supplements for children",
            "Continued feeding"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/cholera" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/cholera.html" }
        ],
        keywords: ["cholera", "diarrhea", "water-borne", "dehydration", "ors"]
    },
    {
        id: "asthma",
        name: "Asthma",
        category: "Respiratory",
        description: "A chronic condition affecting the airways in the lungs. The airways become inflamed and narrow, making breathing difficult. Symptoms include wheezing, coughing, and shortness of breath.",
        causes: [
            "Genetic factors",
            "Allergic reactions",
            "Environmental factors",
            "Respiratory infections in childhood"
        ],
        riskFactors: [
            "Family history of asthma or allergies",
            "Exposure to allergens (dust, pollen)",
            "Air pollution",
            "Smoking or secondhand smoke",
            "Obesity",
            "Occupational irritants"
        ],
        prevention: [
            "Identify and avoid triggers",
            "Keep home clean and dust-free",
            "Avoid smoking and smoke exposure",
            "Regular exercise",
            "Maintain healthy weight",
            "Follow asthma action plan"
        ],
        treatment: [
            "Inhaled corticosteroids (preventer)",
            "Quick-relief inhalers (reliever)",
            "Long-acting bronchodilators",
            "Avoiding triggers",
            "Regular monitoring"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/asthma" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/asthma.html" }
        ],
        keywords: ["asthma", "breathing", "wheezing", "inhaler", "respiratory"]
    },
    {
        id: "heart-disease",
        name: "Coronary Heart Disease",
        category: "Cardiovascular",
        description: "A condition where the coronary arteries become narrowed or blocked, reducing blood flow to the heart. It can lead to chest pain (angina) or heart attack.",
        causes: [
            "Atherosclerosis (plaque buildup)",
            "High cholesterol",
            "High blood pressure",
            "Smoking",
            "Diabetes"
        ],
        riskFactors: [
            "High blood pressure",
            "High cholesterol",
            "Smoking",
            "Diabetes",
            "Obesity",
            "Sedentary lifestyle",
            "Family history",
            "Stress"
        ],
        prevention: [
            "Healthy diet low in saturated fats",
            "Regular physical activity",
            "Maintain healthy weight",
            "Don't smoke",
            "Limit alcohol",
            "Manage stress",
            "Control blood pressure and cholesterol"
        ],
        treatment: [
            "Lifestyle changes",
            "Medications (statins, aspirin, beta-blockers)",
            "Angioplasty and stenting",
            "Coronary artery bypass surgery",
            "Cardiac rehabilitation"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/coronaryarterydisease.html" },
            { name: "Gov UK", url: "https://www.gov.uk/health-and-social-care" }
        ],
        keywords: ["heart disease", "coronary", "heart attack", "angina", "cardiovascular"]
    },
    {
        id: "myocardial-infarction",
        name: "Myocardial Infarction (Heart Attack)",
        category: "Cardiovascular",
        description: "A medical emergency where blood flow to the heart muscle is abruptly cut off, causing tissue damage. It is usually caused by a blockage in one or more of the coronary arteries.",
        causes: [
            "Blockage of coronary arteries (coronary artery disease)",
            "Coronary artery spasm",
            "Tear in the heart artery (spontaneous coronary artery dissection)"
        ],
        riskFactors: [
            "High blood pressure",
            "High cholesterol",
            "Smoking",
            "Diabetes",
            "Obesity",
            "Age (Men > 45, Women > 55)",
            "Family history of heart attacks"
        ],
        prevention: [
            "Control blood pressure and cholesterol",
            "Quit smoking",
            "Exercise regularly",
            "Maintain a healthy weight",
            "Manage stress",
            "Limit alcohol"
        ],
        treatment: [
            "Emergency medical attention (aspirin, nitroglycerin)",
            "Thrombolytic therapy (clot busters)",
            "Angioplasty and stenting",
            "Coronary artery bypass surgery",
            "Cardiac rehabilitation"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/heartattack.html" }
        ],
        keywords: ["heart attack", "myocardial infarction", "chest pain", "cardiovascular"]
    },
    {
        id: "heart-failure",
        name: "Heart Failure",
        category: "Cardiovascular",
        description: "A chronic condition where the heart doesn't pump blood as well as it should. It can occur if the heart is too weak or too stiff.",
        causes: [
            "Coronary artery disease",
            "High blood pressure",
            "Heart valve conditions",
            "Damage to heart muscle (cardiomyopathy)",
            "Myocarditis"
        ],
        riskFactors: [
            "High blood pressure",
            "Coronary artery disease",
            "Heart attack",
            "Diabetes",
            "Some diabetes medications",
            "Sleep apnea",
            "Congenital heart defects",
            "Valvular heart disease",
            "Viruses",
            "Alcohol use",
            "Tobacco use"
        ],
        prevention: [
            "Not smoking",
            "Controlling certain conditions, such as high blood pressure and diabetes",
            "Staying physically active",
            "Eating healthy foods",
            "Maintaining a healthy weight",
            "Reducing and managing stress"
        ],
        treatment: [
            "Medications (ACE inhibitors, beta blockers, diuretics)",
            "Surgery and medical devices (defibrillators, pacemakers)",
            "Heart transplant",
            "Lifestyle changes"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/heartfailure.html" }
        ],
        keywords: ["heart failure", "congestive heart failure", "cardiovascular", "edema", "shortness of breath"]
    },
    {
        id: "anemia",
        name: "Anemia",
        category: "Blood Disorder",
        description: "A condition in which the blood doesn't have enough healthy red blood cells to carry adequate oxygen to tissues. The most common type is iron-deficiency anemia.",
        causes: [
            "Iron deficiency",
            "Vitamin B12 deficiency",
            "Folic acid deficiency",
            "Chronic diseases",
            "Genetic conditions (sickle cell, thalassemia)"
        ],
        riskFactors: [
            "Poor diet lacking iron or vitamins",
            "Heavy menstrual periods",
            "Pregnancy",
            "Chronic conditions",
            "Family history of inherited anemia",
            "Age"
        ],
        prevention: [
            "Iron-rich diet (leafy greens, meat, beans)",
            "Vitamin C to enhance iron absorption",
            "Folic acid and B12 supplementation if needed",
            "Regular health check-ups",
            "Treat underlying conditions"
        ],
        treatment: [
            "Iron supplements",
            "Vitamin B12 injections",
            "Folic acid supplements",
            "Treating underlying cause",
            "Blood transfusion in severe cases"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/health-topics/anaemia" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/anemia.html" }
        ],
        keywords: ["anemia", "iron deficiency", "blood", "hemoglobin", "fatigue"]
    },
    {
        id: "diarrhea",
        name: "Diarrheal Diseases",
        category: "Gastrointestinal",
        description: "A condition characterized by loose, watery stools occurring more frequently than usual. It can lead to dehydration, especially dangerous in children.",
        causes: [
            "Bacterial infections (E. coli, Salmonella)",
            "Viral infections (rotavirus, norovirus)",
            "Parasitic infections",
            "Contaminated food or water",
            "Food intolerances"
        ],
        riskFactors: [
            "Poor sanitation",
            "Lack of clean water",
            "Malnutrition",
            "Weakened immunity",
            "Travel to developing countries"
        ],
        prevention: [
            "Wash hands with soap regularly",
            "Drink safe, clean water",
            "Proper food handling and cooking",
            "Rotavirus vaccination for children",
            "Breastfeeding for infants"
        ],
        treatment: [
            "Oral Rehydration Solution (ORS)",
            "Zinc supplements for children",
            "Continue feeding",
            "Antibiotics only for specific infections",
            "Seek care if dehydration worsens"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/diarrhea.html" }
        ],
        keywords: ["diarrhea", "loose stools", "dehydration", "ors", "stomach"]
    },
    {
        id: "cataract",
        name: "Cataract",
        category: "Eye",
        description: "A clouding of the clear lens of the eye. It is the leading cause of blindness worldwide. It generally develops slowly and eventually interferes with vision.",
        causes: [
            "Aging (most common)",
            "Diabetes",
            "Trauma to the eye",
            "Radiation (UV) exposure",
            "Long-term use of corticosteroids"
        ],
        riskFactors: [
            "Increasing age",
            "Diabetes",
            "Excessive exposure to sunlight",
            "Smoking",
            "Obesity",
            "High blood pressure",
            "Previous eye injury or inflammation",
            "Previous eye surgery"
        ],
        prevention: [
            "Regular eye examinations",
            "Quit smoking",
            "Manage other health problems",
            "Choose a healthy diet that includes plenty of fruits and vegetables",
            "Wear sunglasses",
            "Reduce alcohol use"
        ],
        treatment: [
            "Prescription glasses (early stages)",
            "Cataract surgery (removing the cloudy lens and replacing it with an artificial one)"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/cataract.html" }
        ],
        keywords: ["cataract", "blurry vision", "eye", "cloudy lens", "blindness"]
    },
    {
        id: "glaucoma",
        name: "Glaucoma",
        category: "Eye",
        description: "A group of eye conditions that damage the optic nerve, the health of which is vital for good vision. This damage is often caused by an abnormally high pressure in your eye.",
        causes: [
            "High internal eye pressure (intraocular pressure)",
            "Blocked drainage in your eye",
            "Medications like corticosteroids",
            "Reduced blood flow to your optic nerve"
        ],
        riskFactors: [
            "High internal eye pressure (intraocular pressure)",
            "Being over age 60",
            "Being black, Asian or Hispanic",
            "Family history of glaucoma",
            "Certain medical conditions (diabetes, heart disease, high blood pressure)",
            "Corneas that are thin in the center"
        ],
        prevention: [
            "Get regular dilated eye examinations",
            "Know your family's eye health history",
            "Exercise safely",
            "Take prescribed eye drops regularly",
            "Wear eye protection"
        ],
        treatment: [
            "Eye drops",
            "Oral medications",
            "Laser therapy",
            "Surgery (filtering surgery, drainage tubes)"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/glaucoma.html" }
        ],
        keywords: ["glaucoma", "optic nerve", "eye pressure", "vision loss", "eye"]
    },
    {
        id: "diabetic-retinopathy",
        name: "Diabetic Retinopathy",
        category: "Eye",
        description: "A diabetes complication that affects eyes. It's caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).",
        causes: [
            "High blood sugar levels over time",
            "Blockage of tiny blood vessels that nourish the retina",
            "Growth of new, abnormal blood vessels"
        ],
        riskFactors: [
            "Duration of diabetes — the longer you have diabetes, the greater your risk",
            "Poor control of your blood sugar level",
            "High blood pressure",
            "High cholesterol",
            "Pregnancy",
            "Tobacco use"
        ],
        prevention: [
            "Manage your diabetes",
            "Monitor your blood sugar level",
            "Keep your blood pressure and cholesterol under control",
            "Quit smoking"
        ],
        treatment: [
            "Dilated eye exams for early detection",
            "Injecting medications into the eye",
            "Photocoagulation (laser treatment)",
            "Vitrectomy"
        ],
        sources: [
            { name: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment" },
            { name: "MedlinePlus", url: "https://medlineplus.gov/diabeticretinopathy.html" }
        ],
        keywords: ["diabetic retinopathy", "diabetes", "vision loss", "retina", "eye"]
    }
];

export const searchDiseases = (query: string): Disease[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];

    return diseases.filter(disease =>
        disease.name.toLowerCase().includes(lowerQuery) ||
        disease.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
        disease.category.toLowerCase().includes(lowerQuery)
    );
};

export const getDiseaseById = (id: string): Disease | undefined => {
    return diseases.find(disease => disease.id === id);
};

export const categories = [...new Set(diseases.map(d => d.category))].sort();

/** The Lab's condition list is derived from here — never hard-coded on the Lab side. */
export const modelledConditions = diseases.filter(d => d.labModel);
