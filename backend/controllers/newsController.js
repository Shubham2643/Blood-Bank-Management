import News from "../models/newsModel.js";
import { AppError } from "../utils/errorHandler.js";

const DEFAULT_NEWS = [
  {
    title: "World Blood Donor Day 2026: Ministry of Health Launches National Mega Donation Campaign",
    summary: "Under the banner of eRaktKosh, health authorities set up over 500 mega blood donation camps nationwide to celebrate World Blood Donor Day on June 14, 2026.",
    content: `### Celebrating World Blood Donor Day 2026
In a major push to strengthen voluntary blood donation across the country, the Union Ministry of Health and Family Welfare today inaugurated the National Mega Blood Donation Campaign on the occasion of World Blood Donor Day (June 14, 2026).

#### Theme: "Give blood, give plasma, share life, share often"
This year's global campaign focuses on patients requiring life-long transfusion support. The campaign emphasizes the role that every single person can play by giving the valuable gift of blood or plasma.

#### Nationwide Mega Camps
Over 500 state-of-the-art blood donation camps have been set up in partnership with the Red Cross, government hospitals, and regional NGOs. All camps are linked directly to the national **eRaktKosh** digital directory, allowing real-time update of blood reserves.

#### Government Appeals to Citizens
Health officials have urged healthy citizens aged 18 to 65 to visit their nearest government blood bank or mobile van. "Voluntary donation is not just a health contribution, it is a social responsibility that saves hundreds of lives daily," said the Union Health Secretary during the launch.`,
    category: "Emergency",
    readTime: 3,
    image: "/news/donor_day_mega.png",
    author: "Dr. Sarah Johnson",
    likes: 312,
    breaking: true,
    featured: true,
    comments: [
      { name: "Amit Sharma", text: "Proud to have donated blood today at the Red Cross camp. The facilities are excellent!" }
    ],
    createdAt: new Date("2026-06-14T09:00:00Z")
  },
  {
    title: "National Blood Transfusion Council (NBTC) Issues Summer Heatwave Donor Advisories",
    summary: "NBTC releases strict guidelines for blood centers to ensure donor comfort, hydration, and safety during peak summer temperatures.",
    content: `### NBTC Summer Donation Guidelines
The National Blood Transfusion Council (NBTC) has released a comprehensive advisory for all licensed blood banks and donor camps to manage peak summer temperatures and prevent donor deferrals or adverse reactions.

#### Key Directives for Blood Banks
1. **Climate Control**: All donation areas, pre-screening rooms, and post-donation recovery lounges must be fully air-conditioned.
2. **Hydration Stations**: Mandatory distribution of electrolyte-rich fluids, oral rehydration solutions (ORS), and chilled fresh water to donors before and after donation.
3. **Cool-down Period**: Donors must be observed in a cool environment for at least 20 minutes post-donation to ensure vital stability.

#### Guidelines for Donors
- Avoid donating on an empty stomach.
- Consume at least 500ml of water or juice 30 minutes prior to donation.
- Avoid direct sun exposure immediately after donating.`,
    category: "Emergency",
    readTime: 4,
    image: "/news/heatwave_donor_guide.png",
    author: "Prof. Michael Chen",
    likes: 184,
    breaking: true,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-11T11:30:00Z")
  },
  {
    title: "eRaktKosh Digital Network Integrates 200+ Regional Blood Banks for Live Stock Tracking",
    summary: "Expansion of national digital database enables real-time search of blood availability down to local district level.",
    content: `### Digitalization of Blood Repositories
The Ministry of Health has announced the successful integration of 200+ district-level government and private blood banks into the central eRaktKosh portal database.

#### Real-Time Stock Directory
This upgrade allows citizens, emergency responders, and hospitals to search for specific blood groups (such as O-Negative or rare AB-Negative) with real-time stock levels. It aims to eliminate emergency delays and check illegal black-market sales during shortages.

#### Smart Dispatch Features
The portal now features automated stock alerts. If a local hospital's supply of critical blood types falls below a 48-hour buffer, the system automatically suggests transfers from neighboring facilities with surplus inventory.`,
    category: "Hospital Updates",
    readTime: 4,
    image: "/news/eraktkosh_stock_dashboard.png",
    author: "Prof. Michael Chen",
    likes: 198,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-07T10:00:00Z")
  },
  {
    title: "State-of-the-Art Regional Blood Processing Lab Inaugurated in Vadodara",
    summary: "Vadodara's new advanced lab will screen, component-separate, and test up to 1,500 blood units daily, boosting supply safety.",
    content: `### Inauguration of Vadodara Regional Laboratory
A brand new, advanced regional blood processing facility has been officially inaugurated in Vadodara by health department officials.

#### Cutting Edge Component Separation
The lab is equipped with high-speed automated component extractors, enabling rapid separation of whole blood into red cells, fresh frozen plasma, and platelets. This ensures that one unit of donated blood can be effectively split to save up to three separate patients.

#### Molecular testing (NAT)
To guarantee blood safety, the facility uses Nucleic Acid Testing (NAT) screening for HIV, Hepatitis B, and Hepatitis C, reducing the window period of infection detection and ensuring clean transfusions for patients.`,
    category: "Hospital Updates",
    readTime: 4,
    image: "/news/vadodara_blood_lab.png",
    author: "Dr. Sarah Johnson",
    likes: 220,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-01T08:30:00Z")
  },
  {
    title: "New Cardiology Study Confirms Cardiovascular Benefits of Regular Blood Donation",
    summary: "Clinical research published in the Medical Journal indicates regular blood donors experience 30% lower risk of cardiovascular disease.",
    content: `### Cardiovascular Health and Blood Donation
A landmark clinical study tracking 15,000 active donors over a five-year period has published encouraging findings regarding the physical health benefits of regular blood donation.

#### Regulating Iron Viscosity
Voluntary donation regularly sheds excess iron stores from the blood. High iron levels can contribute to arterial oxidation and plaque buildup. By maintaining balanced iron stores, regular donors experience improved blood flow, lower arterial stiffness, and a 30% lower incidence of heart attacks.

#### Regular Mini-Screenings
Every blood donation involves a free screening of hemoglobin, blood pressure, pulse rate, and temperature. This helps donors keep a continuous record of their cardiovascular health, alerting them to early warning signs of hypertension or anemia.`,
    category: "Medical Research",
    readTime: 5,
    image: "/news/heart_cardio_wellness.png",
    author: "Prof. Michael Chen",
    likes: 412,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-24T14:30:00Z")
  },
  {
    title: "Corporate Red Connect Drives Accumulate 1,200 Units Across Mumbai Tech Parks",
    summary: "Joint health campaign by multinational tech hubs secures crucial blood reserves ahead of the monsoon season.",
    content: `### Mumbai Tech Parks Lead Corporate Blood Drive
Mumbai's corporate sector demonstrated exceptional civic responsibility this week during the annual 'Red Connect' corporate donation drive.

#### Strategic Buffer Stocking
Health officials prioritized this drive to build up platelets and blood reserves before the onset of the monsoon season, which historically triggers a spike in dengue and malaria cases requiring blood transfusions.

#### Encouraging First-Time Donors
Over 25 software parks and financial centers hosted donor booths. Out of the 1,200 successful donations, over 45% were from young, first-time corporate employees, creating a new generation of regular blood donors.`,
    category: "Community",
    readTime: 3,
    image: "/news/corporate_donor_booth.png",
    author: "James Wilson",
    likes: 387,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-18T11:00:00Z")
  },
  {
    title: "Delhi University Mega Youth Donation Drive Sets New Student Turnout Record",
    summary: "Student councils coordinate with government blood banks to collect 5,000 units in three days across DU colleges.",
    content: `### Mobilizing Youth for Voluntary Donations
Delhi University campus hosted one of the largest student-run blood donation drives in the state, drawing thousands of young donors.

#### Dynamic Campus Camps
Camps were established across North and South campus colleges. The drive included student volunteers managing the pre-registration desks, distribution of refreshments, and local bands performing to create a celebratory atmosphere.

#### Overwhelming Participation
A record-breaking 5,000 units of blood were collected. Dr. Sarah Johnson praised the students: "The enthusiasm of college students shows that awareness campaigns are working. Building a habit of regular donation early ensures a stable national supply."`,
    category: "Community",
    readTime: 4,
    image: "/news/student_blood_drive.png",
    author: "James Wilson",
    likes: 746,
    breaking: false,
    featured: true,
    comments: [],
    createdAt: new Date("2026-05-09T09:15:00Z")
  },
  {
    title: "Deployment of 20 Advanced Mobile Blood Collection Vans to Rural Districts Launched",
    summary: "Equipped with cold storage and testing bays, new mobile vans bring donation facilities to remote villages.",
    content: `### Rural Outreach Mobile Vans
To address blood shortages in remote rural hospitals, the Ministry of Health has officially flagged off 20 mobile blood collection vans.

#### Fully Equipped Mobile Facilities
Each air-conditioned van features four blood donation beds, a mini-laboratory for pre-donation hemoglobin testing, and sub-zero storage compartments. The vans are designed to hold up to 200 blood units safely under optimal temperature conditions.

#### Serving Remote Areas
The vans will run weekly schedules across remote villages, coordinating with local community centers. In their initial trials, the vans have collected over 1,500 units from voluntary donors.`,
    category: "Community",
    readTime: 3,
    image: "/news/mobile_donor_van.png",
    author: "Robert Chen",
    likes: 310,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-28T10:00:00Z")
  },
  {
    title: "Bombay Phenotype Rare Blood Group Successfully Delivered to Emergency Patient",
    summary: "Rare Blood Registry coordinates quick response to locate and dispatch Mumbai's rarest blood group for surgery.",
    content: `### Bombay Blood Phenotype Rescue
A national registry coordinator successfully managed a critical emergency by locating and securing rare Bombay blood phenotype units for a pediatric cardiac surgery.

#### The Bombay Phenotype
The Bombay blood group is an extremely rare blood phenotype present in less than 0.0004% of the population. Individuals with this group can only receive blood from other Bombay phenotype donors.

#### Rapid Nationwide Coordination
When the request was logged, the eRaktKosh registry identified three matching donors in neighboring cities. Within 12 hours, the donors voluntarily donated, and the units were airlifted to the hospital, leading to a successful surgical recovery.`,
    category: "Success Story",
    readTime: 6,
    image: "/news/bombay_blood_chest.png",
    author: "Priya Patel",
    likes: 928,
    breaking: false,
    featured: true,
    comments: [],
    createdAt: new Date("2026-04-18T16:00:00Z")
  },
  {
    title: "WHO Launches 'Voluntary 2030' Campaign to Eliminate Replacement Donations",
    summary: "International health campaign aims to transition all blood bank networks to 100% voluntary, unpaid donations by 2030.",
    content: `### WHO Voluntary Donation Directive
The World Health Organization (WHO) has launched the global 'Voluntary 2030' campaign to phase out replacement and family blood donations in favor of 100% voluntary, unpaid donation systems.

#### Safety and Voluntary Donors
Clinical data shows that blood collected from voluntary, regular, unpaid donors has significantly lower rates of transfusion-transmitted infections compared to replacement donors (relatives or friends who donate under pressure during family emergencies).

#### Developing National Infrastructure
The WHO initiative will fund training programs for local donor motivators, build national registries, and establish automated cold-chain logistics to support stable, voluntary supply networks.`,
    category: "Medical Research",
    readTime: 5,
    image: "/news/who_voluntary_blood.png",
    author: "Dr. Alan Foster",
    likes: 589,
    breaking: true,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-05T15:00:00Z")
  },
  {
    title: "National Haemovigilance Program: Health Ministry Updates Safety Protocols for Transfusion Errors",
    summary: "Health authorities release updated guidelines under the National Haemovigilance Program to minimize error rates and enhance patient safety during transfusions.",
    content: `### Strengthening Transfusion Safety Protocols
The Union Ministry of Health has issued updated guidelines under the National Haemovigilance Program (NHP) aimed at eliminating blood transfusion errors and securing patient safety.

#### Key Directives
1. **Double Verification**: Mandatory double-person checks for all blood bags and recipient bands before transfusion commences.
2. **Barcode Labeling**: Implementing barcode-scanning verification at bedside points.
3. **Haemovigilance Reporting**: Standardized templates for reporting adverse events within 24 hours.

#### Health Minister's Statement
"Safety is paramount. The updated haemovigilance protocols establish strict clinical guardrails to protect patient lives," noted the Union Health Secretary during the presentation.`,
    category: "Emergency",
    readTime: 4,
    image: "/news/haemovigilance_safety_protocol.png",
    author: "Dr. Sarah Johnson",
    likes: 154,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-13T10:00:00Z")
  },
  {
    title: "Rare Blood Group Outreach: Registry Dispatches Rare Rh-Null 'Golden Blood' to Patient in Kolkata",
    summary: "National Rare Blood Group Registry coordinates a swift dispatch of the extremely rare Rh-Null phenotype for an emergency cardiac patient in Kolkata.",
    content: `### Delivering the Golden Blood
The National Rare Blood Group Registry coordinated a life-saving dispatch of Rh-null (commonly referred to as 'Golden Blood') to a patient in Kolkata undergoing an emergency cardiac procedure.

#### Understanding Rh-Null
Rh-null blood lacks all Rh antigens, making it extremely rare (present in less than 50 people globally). Individuals with this type can only receive blood from other Rh-null donors.

#### Swift Transport Logistics
Through cooperation with government airlines, the temperature-controlled transport container was dispatched from the central registry and delivered to Kolkata within 8 hours. The surgical team confirmed the successful transfusion and recovery of the patient.`,
    category: "Success Story",
    readTime: 5,
    image: "/news/golden_blood_dispatch.png",
    author: "Priya Patel",
    likes: 672,
    breaking: true,
    featured: true,
    comments: [],
    createdAt: new Date("2026-06-10T14:15:00Z")
  },
  {
    title: "World Red Cross Day 2026: Honoring Volunteers Who Contributed Over 100 Donations",
    summary: "State health councils and the Red Cross honor veteran blood donors who hit the milestone of 100 voluntary donations.",
    content: `### Celebrating Volunteer Centurions
On World Red Cross Day, the State Health Council presented awards to voluntary blood donors who have contributed over 100 times to public blood reserves.

#### Lifetime of Contribution
"Voluntary donors are the silent heroes of our healthcare system," said the Red Cross Chairman. Over 50 donors received crystal trophies and health recognition cards.

#### Inspiration for Youth
The event included panel discussions with college students to encourage regular voluntary donation early in life. One of the awardees stated: "Donating blood takes 10 minutes but gives someone else a lifetime."`,
    category: "Community",
    readTime: 3,
    image: "/news/red_cross_centurion_awards.png",
    author: "James Wilson",
    likes: 412,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-08T09:30:00Z")
  },
  {
    title: "Indian Association of Blood Cancer Patients Partners with eRaktKosh for Platelet Matching",
    summary: "New partnership aims to match cancer patients requiring regular platelet transfusions directly with nearby voluntary donors.",
    content: `### Digital Platform for Cancer Patient Support
The Indian Association of Blood Cancer Patients has announced a digital integration with the central eRaktKosh directory to support platelet matching.

#### The Role of Platelets in Cancer Treatment
Chemotherapy and leukemia often drop patient platelet counts to dangerous levels, requiring frequent transfusions. Regular matching ensures patients receive compatible platelets quickly.

#### Platform Functionality
Hospitals can log platelet requests, which automatically alert matching donors registered in the regional directory, reducing waiting times from days to hours.`,
    category: "Medical Research",
    readTime: 4,
    image: "/news/platelet_cancer_matching.png",
    author: "Prof. Michael Chen",
    likes: 298,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-05T11:00:00Z")
  },
  {
    title: "New Guidelines Issued for Autologous Blood Donation Prior to Scheduled Surgeries",
    summary: "Health ministry releases official directives on autologous donation, allowing patients to store their own blood before elective surgeries.",
    content: `### Storing Your Own Blood for Surgery
The Department of Health has released safety guidelines for autologous blood donation—the practice of donating and storing one's own blood for future use.

#### Advantages of Autologous Donation
- Eliminates the risk of transfusion-transmitted infections.
- Minimizes risk of allergic reactions.
- Preserves national public stock for unexpected trauma cases.

#### Eligibility Criteria
Patients undergoing elective orthopedic or cardiac surgeries can donate up to 4 weeks prior to the surgery, provided their hemoglobin levels remain above 11 g/dL.`,
    category: "Health Tips",
    readTime: 3,
    image: "/news/autologous_donor_prep.png",
    author: "Dr. Sarah Johnson",
    likes: 187,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-06-03T10:45:00Z")
  },
  {
    title: "Government Blood Bank in Chennai Achieves 100% Paperless Smart Operations",
    summary: "Chennai's model blood bank transitions completely to digital stock tracking, NFC labels, and tablet-based donor screening.",
    content: `### Modernizing Blood Bank Operations
The Chennai Government Blood Bank has officially completed its transition to 100% paperless operations, serving as a model for public facilities.

#### Smart Integration Features
- **NFC-Tagged Blood Bags**: Real-time tracking of temperature and storage location.
- **Tablet Pre-Screening**: Automated donor questionnaires reduce processing times by 60%.
- **Live Inventory Feeds**: Linked directly to regional emergency dispatch networks.

#### Efficiency Gains
The transition has eliminated manual transcription errors and significantly optimized donor turnaround times during peak campaign periods.`,
    category: "Hospital Updates",
    readTime: 4,
    image: "/news/paperless_smart_bloodbank.png",
    author: "Robert Chen",
    likes: 345,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-30T11:15:00Z")
  },
  {
    title: "Health Minister Lauds Tech-Driven Smart Blood Dispensing Cabinets in AIIMS Delhi",
    summary: "AIIMS Delhi launches automated, biometric-activated refrigerated blood storage cabinets in critical surgical wards.",
    content: `### Biometric Blood Cabinets at AIIMS
The Union Health Minister inaugurated AIIMS Delhi's new automated smart blood dispensing cabinets installed in emergency surgical suites.

#### Ward-Level Cold Chain
These biometric cabinets store compatible blood products locally inside surgery wings. Authorized clinicians scan their credentials and patient barcodes to dispense the exact matching unit immediately.

#### Eliminating Delivery Delays
By removing the need to fetch units from central vaults during surgery, the smart cabinets save crucial minutes in trauma cases and ensure temperature integrity.`,
    category: "Hospital Updates",
    readTime: 4,
    image: "/news/smart_dispensing_cabinets.png",
    author: "Dr. Sarah Johnson",
    likes: 276,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-27T08:30:00Z")
  },
  {
    title: "Pediatric Thalassemia Support Campaign: Providing Free Lifelong Transfusions Across State Hospitals",
    summary: "State health departments launch a comprehensive pediatric support program providing cost-free transfusions and filter kits for children with Thalassemia.",
    content: `### Thalassemia Pediatric Care Initiative
A new state-sponsored public health program will fund cost-free blood transfusions, iron-chelation therapies, and leucocyte-depleted filter kits for pediatric Thalassemia patients.

#### Lifelong Medical Support
Children with Thalassemia major require transfusions every 2 to 4 weeks. The financial assistance program aims to reduce the economic burden on affected families.

#### Blood Security Priority
Participating government blood banks will maintain dedicated reserves of O-Negative and matching groups to guarantee priority access for pediatric patients.`,
    category: "Emergency",
    readTime: 5,
    image: "/news/thalassemia_pediatric_support.png",
    author: "Dr. Alan Foster",
    likes: 584,
    breaking: true,
    featured: true,
    comments: [],
    createdAt: new Date("2026-05-22T14:00:00Z")
  },
  {
    title: "Military Blood Bank Coordination: Border Security Forces Organize Camp on Kargil Vijay Diwas",
    summary: "Border Security Forces organize a voluntary blood donation camp to support military and civil border hospital reserves.",
    content: `### BSF Kargil Vijay Diwas Camp
To commemorate Kargil Vijay Diwas, the Border Security Forces (BSF) coordinated a massive voluntary blood donation camp in association with army medical corps.

#### Supporting National Reserves
BSF personnel donated over 800 units of blood within a single day. The collected units will support military hospitals and nearby civilian healthcare centers.

#### Spirit of Service
"Donating blood is another form of service to the nation. We are proud to contribute to the health of our soldiers and citizens alike," stated the BSF Commandant.`,
    category: "Community",
    readTime: 3,
    image: "/news/military_border_security_camp.png",
    author: "James Wilson",
    likes: 912,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-15T09:00:00Z")
  },
  {
    title: "Public Health Advisory: Guidelines for Blood Donation Post Viral Infections and Vaccinations",
    summary: "Ministry of Health releases updated deferral charts outlining when individuals can donate after viral recovery or immunization.",
    content: `### Post-Infection Deferral Guidelines
The Ministry of Health has published an updated advisory clarifying donation eligibility timelines for individuals recovering from viral infections or receiving vaccines.

#### Deferral Periods
- **COVID-19/Flu Recovery**: Eligible to donate 14 days after complete resolution of symptoms.
- **Dengue/Malaria**: Deferral of 3 months post-recovery.
- **Inactivated Vaccines (Flu, Tetanus)**: No deferral period if the donor feels healthy.
- **Live Attenuated Vaccines (MMR, Varicella)**: Deferral of 4 weeks.

#### Screening Reinforcements
Blood bank technicians have been instructed to include these timelines in standard donor pre-screening interviews.`,
    category: "Health Tips",
    readTime: 3,
    image: "/news/infection_vaccination_advisory.png",
    author: "Dr. Sarah Johnson",
    likes: 219,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-12T10:00:00Z")
  },
  {
    title: "ASHA Workers Trained to Screen and Motivate Voluntary Blood Donors in Uttar Pradesh",
    summary: "State health mission launches training programs for ASHA workers to drive voluntary blood donation in rural villages.",
    content: `### Empowering ASHA Workers for Blood Drives
Uttar Pradesh's State Health Mission has initiated training programs for Accredited Social Health Activists (ASHA) to promote voluntary blood donation.

#### Rural Outreach Focus
ASHA workers will be equipped with screening checklists to identify eligible healthy donors and explain the safety of voluntary donation.

#### Overcoming Superstitions
The training focuses on addressing cultural myths and fears surrounding blood donation in rural villages, laying the groundwork for mobile collection vans.`,
    category: "Community",
    readTime: 4,
    image: "/news/asha_workers_training.png",
    author: "Priya Patel",
    likes: 476,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-05T11:30:00Z")
  },
  {
    title: "Rotary Club Collaborates with State Blood Council for Cold-Chain Logistics Transport Vans",
    summary: "Rotary Club donates 5 specialized refrigerated transport vans to secure regional blood transportation chains.",
    content: `### Cold-Chain Logistics Expansion
The Rotary Club has collaborated with the State Blood Council to donate 5 advanced refrigerated vans for blood product transport.

#### Specialized Climate Controls
The transport vans feature automated refrigeration units that maintain red blood cells at 2-6°C and platelets with agitation setups.

#### Serving District Networks
These vans will serve transportation routes between district-level processing hubs and rural hospital distribution banks, preventing heat-related waste.`,
    category: "Community",
    readTime: 3,
    image: "/news/cold_chain_transport_vans.png",
    author: "James Wilson",
    likes: 312,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-05-02T13:00:00Z")
  },
  {
    title: "National Plasma Fractionation Centre to Increase Supply of Immunoglobulins and Albumin",
    summary: "Central government allocates funding to expand plasma fractionation capacity, securing life-saving protein therapies.",
    content: `### Expanding Plasma Fractionation Capabilities
The Ministry of Health has approved a major capacity expansion at the National Plasma Fractionation Centre to increase local production of critical therapeutic proteins.

#### Essential Plasma Therapies
- **Immunoglobulins**: Crucial for immunodeficient patients.
- **Albumin**: Essential for critical burn injuries and shock therapies.
- **Clotting Factors**: Life-saving treatments for Hemophilia.

#### Safety and Processing Upgrades
The facility will incorporate automated fractionation chambers and viral clearance steps to meet WHO plasma processing standards.`,
    category: "Medical Research",
    readTime: 4,
    image: "/news/plasma_fractionation_centre.png",
    author: "Prof. Michael Chen",
    likes: 218,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-26T15:00:00Z")
  },
  {
    title: "Indian Medical Association Seminar Highlights Cord Blood Banking Benefits and Ethical Guidelines",
    summary: "IMA hosts national seminar on stem cell cryopreservation, highlighting cord blood benefits and warning against private banking marketing.",
    content: `### IMA Cord Blood Banking Seminar
The Indian Medical Association (IMA) hosted a national seminar on cord blood stem cell cryopreservation, addressing ethical and clinical aspects.

#### Therapeutic Potential
Hematologists detailed how stem cells from umbilical cord blood can treat blood cancers, metabolic disorders, and immune deficiencies.

#### Public vs. Private Registries
IMA experts emphasized supporting public cord registries. "Private storage should only be recommended in specific cases with medical indications, whereas public banks provide global matching resources," the panel concluded.`,
    category: "Medical Research",
    readTime: 5,
    image: "/news/cord_blood_banking_seminar.png",
    author: "Prof. Michael Chen",
    likes: 310,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-23T11:00:00Z")
  },
  {
    title: "Guinness World Record Attempt: Over 10,000 Donors Register at Single-Day Mega Camp in Bengaluru",
    summary: "NGOs and health departments coordinate a massive single-day blood drive in Bengaluru, targeting a new participation milestone.",
    content: `### Record-Breaking Blood Drive in Bengaluru
Bengaluru hosted a massive single-day voluntary blood donation camp that saw over 10,000 citizens register to donate.

#### Campaign Coordination
The drive was organized at the central exhibition grounds, featuring over 150 blood donation cots and 300 medical professionals working in shifts.

#### Strengthening Buffers
The drive successfully collected over 8,500 units, providing vital stock reserves for government hospitals across Karnataka ahead of summer.`,
    category: "Community",
    readTime: 4,
    image: "/news/bengaluru_record_mega_camp.png",
    author: "Priya Patel",
    likes: 1205,
    breaking: true,
    featured: true,
    comments: [],
    createdAt: new Date("2026-04-15T09:00:00Z")
  },
  {
    title: "State-of-the-Art Blood Mobile Collection Unit Gifted to Jammu & Kashmir Hill Districts",
    summary: "Health department deploys an advanced all-terrain blood mobile van to serve remote valleys in Jammu & Kashmir.",
    content: `### Mobilizing Blood Collection in J&K Valleys
The Ministry of Health has deployed a custom, all-terrain blood mobile collection unit to serve remote hill districts in Jammu & Kashmir.

#### Off-Road Capabilities
The specialized heavy-duty vehicle is equipped with reinforced suspension, climate-controlled interiors, and satellite connection to access registry databases in remote locations.

#### Community Integration
The mobile van runs scheduled collection stops in coordinate with rural community centers, allowing rural residents to donate safely without traveling to urban centers.`,
    category: "Community",
    readTime: 3,
    image: "/news/jammukashmir_mobile_collection.png",
    author: "Robert Chen",
    likes: 412,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-12T10:30:00Z")
  },
  {
    title: "New Research Proves Efficacy of Pathogen Reduction Technology for Platelet Storage",
    summary: "Clinical researchers publish findings confirming that PRT technology extends platelet storage limits while securing safety.",
    content: `### Advancements in Platelet Storage Safety
A clinical research study published in the Medical Journal has validated Pathogen Reduction Technology (PRT) efficacy in extending platelet shelf life.

#### How PRT Works
PRT utilizes riboflavin and ultraviolet light to target and inactivate viruses, bacteria, and parasites in collected platelet units.

#### Extending Critical Shelf-life
Platelets usually expire within 5 days due to bacterial contamination risks. The research confirms PRT extends safe storage up to 7 days, reducing wastage of rare blood types.`,
    category: "Medical Research",
    readTime: 4,
    image: "/news/pathogen_reduction_technology.png",
    author: "Dr. Alan Foster",
    likes: 289,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-09T14:00:00Z")
  },
  {
    title: "Awareness Initiative: High School Curriculum to Include Blood Biology and Donation Basics",
    summary: "Education boards partner with blood councils to introduce biology and donation awareness chapters in secondary schools.",
    content: `### Educating the Future Donor Generation
The National Board of Secondary Education has approved a curriculum update incorporating blood biology and voluntary donation awareness.

#### Classroom Chapters
- **Blood Components**: Functions of red/white cells, platelets, and plasma.
- **Blood Typing**: ABO and Rh systems.
- **Social Impact**: Demystifying myths and illustrating the significance of donation.

#### Building Awareness Early
"Familiarizing students with donation science early removes future hesitation and builds a positive social perspective," noted the Board Director.`,
    category: "Community",
    readTime: 3,
    image: "/news/highschool_curriculum_awareness.png",
    author: "James Wilson",
    likes: 389,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-07T09:30:00Z")
  },
  {
    title: "E-RaktKosh Portal Launches WhatsApp Chatbot for Instant Nearest Blood Bank Queries",
    summary: "Digital health portal introduces an automated WhatsApp chatbot enabling citizens to search blood availability on their phones.",
    content: `### eRaktKosh Portal Mobile Integration
The eRaktKosh digital directory has officially launched an automated WhatsApp chatbot to support public blood queries.

#### Quick Access Services
- **Stock Availability**: Check specific blood types in nearby cities.
- **Location Finder**: Identify the nearest licensed blood banks or donation camps.
- **Donor Registration**: Link profiles to receive emergency notifications.

#### Simple Chat Access
Users text 'BLOOD' to the registered helpline number to start interacting with the chatbot, getting instant real-time data on their phones.`,
    category: "Hospital Updates",
    readTime: 3,
    image: "/news/eraktkosh_whatsapp_chatbot.png",
    author: "Robert Chen",
    likes: 624,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-03T11:00:00Z")
  },
  {
    title: "Union Cabinet Approves Financial Assistance for Modernizing Municipal Blood Storage Facilities",
    summary: "Union Cabinet approves funding to upgrade storage facilities, cooling infrastructure, and testing labs in municipal towns.",
    content: `### Upgrading Municipal Blood Bank Infrastructure
The Union Cabinet has approved a financial package to modernize municipal blood storage and testing facilities across Tier-2 and Tier-3 towns.

#### Program Details
- **Cooling Upgrades**: Deploying high-efficiency, dual-compressor medical refrigeration units.
- **Testing Labs**: Providing automated ELISA and NAT screening equipment.
- **Backup Power**: Funding solar battery backup systems to ensure cold-chain integrity during power cuts.

#### Strategic Objectives
The modernization program aims to standardize blood safety and logistics across smaller municipal towns, securing national supply parity.`,
    category: "Hospital Updates",
    readTime: 4,
    image: "/news/municipal_blood_storage_funding.png",
    author: "Robert Chen",
    likes: 310,
    breaking: false,
    featured: false,
    comments: [],
    createdAt: new Date("2026-04-01T10:00:00Z")
  }
];

export const seedNewsIfEmpty = async () => {
  try {
    const count = await News.countDocuments();
    const hasUnsplash = await News.findOne({ image: /unsplash\.com/ });
    if (count < 30 || hasUnsplash) {
      await News.deleteMany({}); // Delete old seeds to allow fresh seed
      await News.insertMany(DEFAULT_NEWS);
      console.log("✅ Reseeded initial news database with 30 local government-style articles successfully");
    }
  } catch (error) {
    console.error("❌ Error seeding news database:", error);
  }
};

export const getAllNews = async (req, res, next) => {
  try {
    await seedNewsIfEmpty();

    const { page = 1, category, search } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = 6;

    const query = {};

    if (category && category !== "all" && category !== "null") {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      query.$or = [
        { title: regex },
        { summary: regex },
        { content: regex }
      ];
    }

    const totalNews = await News.countDocuments(query);
    const totalPages = Math.ceil(totalNews / pageSize) || 1;

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip((p - 1) * pageSize)
      .limit(pageSize);

    res.json({ news, totalPages });
  } catch (error) {
    next(error);
  }
};

export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);

    if (!newsItem) {
      throw new AppError("News article not found", 404);
    }

    res.json(newsItem);
  } catch (error) {
    next(error);
  }
};

export const getNewsCategories = async (req, res, next) => {
  try {
    await seedNewsIfEmpty();
    const categories = await News.distinct("category");
    res.json({ categories: categories.length ? categories : ["Emergency", "Medical Research", "Community", "Hospital Updates"] });
  } catch (error) {
    next(error);
  }
};

export const getBreakingNews = async (req, res, next) => {
  try {
    await seedNewsIfEmpty();
    const breaking = await News.find({ breaking: true }).sort({ createdAt: -1 });
    res.json({ news: breaking });
  } catch (error) {
    next(error);
  }
};

export const likeNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);

    if (!newsItem) {
      throw new AppError("News article not found", 404);
    }

    newsItem.likes += 1;
    await newsItem.save();

    // Broadcast update
    const io = req.app.get("io");
    if (io) {
      io.emit("news-updated", { id: newsItem._id, likes: newsItem.likes });
    }

    res.json({ success: true, likes: newsItem.likes });
  } catch (error) {
    next(error);
  }
};

export const commentOnNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentText = typeof req.body.comment === "string" ? req.body.comment : req.body.comment?.text || req.body.text;

    if (!commentText || commentText.trim() === "") {
      throw new AppError("Comment text is required", 400);
    }

    const newsItem = await News.findById(id);
    if (!newsItem) {
      throw new AppError("News article not found", 404);
    }

    const commentAuthor = req.user?.username || req.user?.email || "Anonymous";

    const newComment = {
      name: commentAuthor,
      text: commentText.trim(),
      createdAt: new Date()
    };

    newsItem.comments.push(newComment);
    await newsItem.save();

    // Broadcast updated comments in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("news-updated", { id: newsItem._id, comments: newsItem.comments });
    }

    res.json({ success: true, comments: newsItem.comments });
  } catch (error) {
    next(error);
  }
};

export const saveNews = async (req, res, next) => {
  try {
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req, res, next) => {
  try {
    const { title, summary, content, category, readTime, image, breaking, featured } = req.body;

    if (!title || !summary || !content || !category || !image) {
      throw new AppError("Missing required news fields", 400);
    }

    const newsItem = await News.create({
      title,
      summary,
      content,
      category,
      readTime: Number(readTime) || 3,
      image,
      author: req.user?.username || "Admin Team",
      breaking: breaking || false,
      featured: featured || false
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("news-feed-updated");
      if (newsItem.breaking) {
        io.emit("breaking-news-alert", newsItem);
      }
    }

    res.status(201).json({ success: true, news: newsItem });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const newsItem = await News.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!newsItem) {
      throw new AppError("News article not found", 404);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("news-feed-updated");
    }

    res.json({ success: true, news: newsItem });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findByIdAndDelete(id);

    if (!newsItem) {
      throw new AppError("News article not found", 404);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("news-feed-updated");
    }

    res.json({ success: true, message: "News article deleted successfully" });
  } catch (error) {
    next(error);
  }
};
