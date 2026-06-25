import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  Search,
  Filter,
  Clock,
  User,
  Tag,
  ArrowRight,
  Loader2,
  Globe,
  Award,
  TrendingUp,
  AlertCircle,
  X,
  Download,
  Printer,
  ChevronLeft,
  MapPin,
  Activity,
  MessageCircle,
  Eye,
  Mail,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import api, { newsApi as newsApiClient, publicApi } from "../../services/api.js";

// API Service for news
const newsApi = {
  async getAll(filters = {}) {
    try {
      const cleanFilters = {};
      for (const key in filters) {
        if (filters[key] !== null && filters[key] !== "") {
          cleanFilters[key] = filters[key];
        }
      }

      const response = await newsApiClient.getAll(cleanFilters);
      if (response.data && response.data.news) {
        response.data.news = response.data.news.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return { news: MOCK_NEWS, totalPages: 3 };
    }
  },

  async getById(id) {
    try {
      const response = await newsApiClient.getById(id);
      if (response.data) {
        return {
          ...response.data,
          id: response.data._id || response.data.id,
        };
      }
      return null;
    } catch (error) {
      console.error("News API Error:", error);
      return MOCK_NEWS.find(news => news.id === parseInt(id)) || null;
    }
  },

  async getCategories() {
    try {
      const response = await newsApiClient.getCategories();
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return {
        categories: [
          "Blood Donation",
          "Health Tips",
          "Medical Research",
          "Community",
          "Emergency",
          "Success Story",
          "Awareness Campaign",
          "Hospital Updates",
        ],
      };
    }
  },

  async likeNews(id) {
    try {
      const response = await api.post(`/news/${id}/like`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("News API Error:", error);
      return true;
    }
  },

  async saveNews(id) {
    try {
      const response = await api.post(`/news/${id}/save`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("News API Error:", error);
      return true;
    }
  },

  async getBreakingNews() {
    try {
      const response = await newsApiClient.getBreaking();
      if (response.data && response.data.news) {
        response.data.news = response.data.news.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return {
        news: MOCK_NEWS.filter((news) => news.breaking),
      };
    }
  },
};

// Fallback image for news articles
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format";

// Mock Data for realistic news posts
const MOCK_NEWS = [
  {
    id: 1,
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
    author: "Dr. Sarah Johnson",
    date: "June 14, 2026",
    readTime: 3,
    image: "/news/donor_day_mega.png",
    likes: 312,
    comments: [
      { name: "Amit Sharma", text: "Proud to have donated blood today at the Red Cross camp. The facilities are excellent!", createdAt: "2026-06-14T09:15:00Z" }
    ],
    breaking: true,
    featured: true,
  },
  {
    id: 2,
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
    author: "Prof. Michael Chen",
    date: "June 11, 2026",
    readTime: 4,
    image: "/news/heatwave_donor_guide.png",
    likes: 184,
    comments: [],
    breaking: true,
    featured: false,
  },
  {
    id: 3,
    title: "eRaktKosh Digital Network Integrates 200+ Regional Blood Banks for Live Stock Tracking",
    summary: "Expansion of national digital database enables real-time search of blood availability down to local district level.",
    content: `### Digitalization of Blood Repositories
The Ministry of Health has announced the successful integration of 200+ district-level government and private blood banks into the central eRaktKosh portal database.

#### Real-Time Stock Directory
This upgrade allows citizens, emergency responders, and hospitals to search for specific blood groups (such as O-Negative or rare AB-Negative) with real-time stock levels. It aims to eliminate emergency delays and check illegal black-market sales during shortages.

#### Smart Dispatch Features
The portal now features automated stock alerts. If a local hospital's supply of critical blood types falls below a 48-hour buffer, the system automatically suggests transfers from neighboring facilities with surplus inventory.`,
    category: "Hospital Updates",
    author: "Prof. Michael Chen",
    date: "June 07, 2026",
    readTime: 4,
    image: "/news/eraktkosh_stock_dashboard.png",
    likes: 198,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 4,
    title: "State-of-the-Art Regional Blood Processing Lab Inaugurated in Vadodara",
    summary: "Vadodara's new advanced lab will screen, component-separate, and test up to 1,500 blood units daily, boosting supply safety.",
    content: `### Inauguration of Vadodara Regional Laboratory
A brand new, advanced regional blood processing facility has been officially inaugurated in Vadodara by health department officials.

#### Cutting Edge Component Separation
The lab is equipped with high-speed automated component extractors, enabling rapid separation of whole blood into red cells, fresh frozen plasma, and platelets. This ensures that one unit of donated blood can be effectively split to save up to three separate patients.

#### Molecular testing (NAT)
To guarantee blood safety, the facility uses Nucleic Acid Testing (NAT) screening for HIV, Hepatitis B, and Hepatitis C, reducing the window period of infection detection and ensuring clean transfusions for patients.`,
    category: "Hospital Updates",
    author: "Dr. Sarah Johnson",
    date: "June 01, 2026",
    readTime: 4,
    image: "/news/vadodara_blood_lab.png",
    likes: 220,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 5,
    title: "New Cardiology Study Confirms Cardiovascular Benefits of Regular Blood Donation",
    summary: "Clinical research published in the Medical Journal indicates regular blood donors experience 30% lower risk of cardiovascular disease.",
    content: `### Cardiovascular Health and Blood Donation
A landmark clinical study tracking 15,000 active donors over a five-year period has published encouraging findings regarding the physical health benefits of regular blood donation.

#### Regulating Iron Viscosity
Voluntary donation regularly sheds excess iron stores from the blood. High iron levels can contribute to arterial oxidation and plaque buildup. By maintaining balanced iron stores, regular donors experience improved blood flow, lower arterial stiffness, and a 30% lower incidence of heart attacks.

#### Regular Mini-Screenings
Every blood donation involves a free screening of hemoglobin, blood pressure, pulse rate, and temperature. This helps donors keep a continuous record of their cardiovascular health, alerting them to early warning signs of hypertension or anemia.`,
    category: "Medical Research",
    author: "Prof. Michael Chen",
    date: "May 24, 2026",
    readTime: 5,
    image: "/news/heart_cardio_wellness.png",
    likes: 412,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 6,
    title: "Corporate Red Connect Drives Accumulate 1,200 Units Across Mumbai Tech Parks",
    summary: "Joint health campaign by multinational tech hubs secures crucial blood reserves ahead of the monsoon season.",
    content: `### Mumbai Tech Parks Lead Corporate Blood Drive
Mumbai's corporate sector demonstrated exceptional civic responsibility this week during the annual 'Red Connect' corporate donation drive.

#### Strategic Buffer Stocking
Health officials prioritized this drive to build up platelets and blood reserves before the onset of the monsoon season, which historically triggers a spike in dengue and malaria cases requiring blood transfusions.

#### Encouraging First-Time Donors
Over 25 software parks and financial centers hosted donor booths. Out of the 1,200 successful donations, over 45% were from young, first-time corporate employees, creating a new generation of regular blood donors.`,
    category: "Community",
    author: "James Wilson",
    date: "May 18, 2026",
    readTime: 3,
    image: "/news/corporate_donor_booth.png",
    likes: 387,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 7,
    title: "Delhi University Mega Youth Donation Drive Sets New Student Turnout Record",
    summary: "Student councils coordinate with government blood banks to collect 5,000 units in three days across DU colleges.",
    content: `### Mobilizing Youth for Voluntary Donations
Delhi University campus hosted one of the largest student-run blood donation drives in the state, drawing thousands of young donors.

#### Dynamic Campus Camps
Camps were established across North and South campus colleges. The drive included student volunteers managing the pre-registration desks, distribution of refreshments, and local bands performing to create a celebratory atmosphere.

#### Overwhelming Participation
A record-breaking 5,000 units of blood were collected. Dr. Sarah Johnson praised the students: "The enthusiasm of college students shows that awareness campaigns are working. Building a habit of regular donation early ensures a stable national supply."`,
    category: "Community",
    author: "James Wilson",
    date: "May 09, 2026",
    readTime: 4,
    image: "/news/student_blood_drive.png",
    likes: 746,
    comments: [],
    breaking: false,
    featured: true,
  },
  {
    id: 8,
    title: "Deployment of 20 Advanced Mobile Blood Collection Vans to Rural Districts Launched",
    summary: "Equipped with cold storage and testing bays, new mobile vans bring donation facilities to remote villages.",
    content: `### Rural Outreach Mobile Vans
To address blood shortages in remote rural hospitals, the Ministry of Health has officially flagged off 20 mobile blood collection vans.

#### Fully Equipped Mobile Facilities
Each air-conditioned van features four blood donation beds, a mini-laboratory for pre-donation hemoglobin testing, and sub-zero storage compartments. The vans are designed to hold up to 200 blood units safely under optimal temperature conditions.

#### Serving Remote Areas
The vans will run weekly schedules across remote villages, coordinating with local community centers. In their initial trials, the vans have collected over 1,500 units from voluntary donors.`,
    category: "Community",
    author: "Robert Chen",
    date: "April 28, 2026",
    readTime: 3,
    image: "/news/mobile_donor_van.png",
    likes: 310,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 9,
    title: "Bombay Phenotype Rare Blood Group Successfully Delivered to Emergency Patient",
    summary: "Rare Blood Registry coordinates quick response to locate and dispatch Mumbai's rarest blood group for surgery.",
    content: `### Bombay Blood Phenotype Rescue
A national registry coordinator successfully managed a critical emergency by locating and securing rare Bombay blood phenotype units for a pediatric cardiac surgery.

#### The Bombay Phenotype
The Bombay blood group is an extremely rare blood phenotype present in less than 0.0004% of the population. Individuals with this group can only receive blood from other Bombay phenotype donors.

#### Rapid Nationwide Coordination
When the request was logged, the eRaktKosh registry identified three matching donors in neighboring cities. Within 12 hours, the donors voluntarily donated, and the units were airlifted to the hospital, leading to a successful surgical recovery.`,
    category: "Success Story",
    author: "Priya Patel",
    date: "April 18, 2026",
    readTime: 6,
    image: "/news/bombay_blood_chest.png",
    likes: 928,
    comments: [],
    breaking: false,
    featured: true,
  },
  {
    id: 10,
    title: "WHO Launches 'Voluntary 2030' Campaign to Eliminate Replacement Donations",
    summary: "International health campaign aims to transition all blood bank networks to 100% voluntary, unpaid donations by 2030.",
    content: `### WHO Voluntary Donation Directive
The World Health Organization (WHO) has launched the global 'Voluntary 2030' campaign to phase out replacement and family blood donations in favor of 100% voluntary, unpaid donation systems.

#### Safety and Voluntary Donors
Clinical data shows that blood collected from voluntary, regular, unpaid donors has significantly lower rates of transfusion-transmitted infections compared to replacement donors (relatives or friends who donate under pressure during family emergencies).

#### Developing National Infrastructure
The WHO initiative will fund training programs for local donor motivators, build national registries, and establish automated cold-chain logistics to support stable, voluntary supply networks.`,
    category: "Medical Research",
    author: "Dr. Alan Foster",
    date: "April 05, 2026",
    readTime: 5,
    image: "/news/who_voluntary_blood.png",
    likes: 589,
    comments: [],
    breaking: true,
    featured: false,
  },
  {
    id: 11,
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
    author: "Dr. Sarah Johnson",
    date: "June 13, 2026",
    readTime: 4,
    image: "/news/haemovigilance_safety_protocol.png",
    likes: 154,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 12,
    title: "Rare Blood Group Outreach: Registry Dispatches Rare Rh-Null 'Golden Blood' to Patient in Kolkata",
    summary: "National Rare Blood Group Registry coordinates a swift dispatch of the extremely rare Rh-Null phenotype for an emergency cardiac patient in Kolkata.",
    content: `### Delivering the Golden Blood
The National Rare Blood Group Registry coordinated a life-saving dispatch of Rh-null (commonly referred to as 'Golden Blood') to a patient in Kolkata undergoing an emergency cardiac procedure.

#### Understanding Rh-Null
Rh-null blood lacks all Rh antigens, making it extremely rare (present in less than 50 people globally). Individuals with this type can only receive blood from other Rh-null donors.

#### Swift Transport Logistics
Through cooperation with government airlines, the temperature-controlled transport container was dispatched from the central registry and delivered to Kolkata within 8 hours. The surgical team confirmed the successful transfusion and recovery of the patient.`,
    category: "Success Story",
    author: "Priya Patel",
    date: "June 10, 2026",
    readTime: 5,
    image: "/news/golden_blood_dispatch.png",
    likes: 672,
    comments: [],
    breaking: true,
    featured: true,
  },
  {
    id: 13,
    title: "World Red Cross Day 2026: Honoring Volunteers Who Contributed Over 100 Donations",
    summary: "State health councils and the Red Cross honor veteran blood donors who hit the milestone of 100 voluntary donations.",
    content: `### Celebrating Volunteer Centurions
On World Red Cross Day, the State Health Council presented awards to voluntary blood donors who have contributed over 100 times to public blood reserves.

#### Lifetime of Contribution
"Voluntary donors are the silent heroes of our healthcare system," said the Red Cross Chairman. Over 50 donors received crystal trophies and health recognition cards.

#### Inspiration for Youth
The event included panel discussions with college students to encourage regular voluntary donation early in life. One of the awardees stated: "Donating blood takes 10 minutes but gives someone else a lifetime."`,
    category: "Community",
    author: "James Wilson",
    date: "June 08, 2026",
    readTime: 3,
    image: "/news/red_cross_centurion_awards.png",
    likes: 412,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 14,
    title: "Indian Association of Blood Cancer Patients Partners with eRaktKosh for Platelet Matching",
    summary: "New partnership aims to match cancer patients requiring regular platelet transfusions directly with nearby voluntary donors.",
    content: `### Digital Platform for Cancer Patient Support
The Indian Association of Blood Cancer Patients has announced a digital integration with the central eRaktKosh directory to support platelet matching.

#### The Role of Platelets in Cancer Treatment
Chemotherapy and leukemia often drop patient platelet counts to dangerous levels, requiring frequent transfusions. Regular matching ensures patients receive compatible platelets quickly.

#### Platform Functionality
Hospitals can log platelet requests, which automatically alert matching donors registered in the regional directory, reducing waiting times from days to hours.`,
    category: "Medical Research",
    author: "Prof. Michael Chen",
    date: "June 05, 2026",
    readTime: 4,
    image: "/news/platelet_cancer_matching.png",
    likes: 298,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 15,
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
    author: "Dr. Sarah Johnson",
    date: "June 03, 2026",
    readTime: 3,
    image: "/news/autologous_donor_prep.png",
    likes: 187,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 16,
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
    author: "Robert Chen",
    date: "May 30, 2026",
    readTime: 4,
    image: "/news/paperless_smart_bloodbank.png",
    likes: 345,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 17,
    title: "Health Minister Lauds Tech-Driven Smart Blood Dispensing Cabinets in AIIMS Delhi",
    summary: "AIIMS Delhi launches automated, biometric-activated refrigerated blood storage cabinets in critical surgical wards.",
    content: `### Biometric Blood Cabinets at AIIMS
The Union Health Minister inaugurated AIIMS Delhi's new automated smart blood dispensing cabinets installed in emergency surgical suites.

#### Ward-Level Cold Chain
These biometric cabinets store compatible blood products locally inside surgery wings. Authorized clinicians scan their credentials and patient barcodes to dispense the exact matching unit immediately.

#### Eliminating Delivery Delays
By removing the need to fetch units from central vaults during surgery, the smart cabinets save crucial minutes in trauma cases and ensure temperature integrity.`,
    category: "Hospital Updates",
    author: "Dr. Sarah Johnson",
    date: "May 27, 2026",
    readTime: 4,
    image: "/news/smart_dispensing_cabinets.png",
    likes: 276,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 18,
    title: "Pediatric Thalassemia Support Campaign: Providing Free Lifelong Transfusions Across State Hospitals",
    summary: "State health departments launch a comprehensive pediatric support program providing cost-free transfusions and filter kits for children with Thalassemia.",
    content: `### Thalassemia Pediatric Care Initiative
A new state-sponsored public health program will fund cost-free blood transfusions, iron-chelation therapies, and leucocyte-depleted filter kits for pediatric Thalassemia patients.

#### Lifelong Medical Support
Children with Thalassemia major require transfusions every 2 to 4 weeks. The financial assistance program aims to reduce the economic burden on affected families.

#### Blood Security Priority
Participating government blood banks will maintain dedicated reserves of O-Negative and matching groups to guarantee priority access for pediatric patients.`,
    category: "Emergency",
    author: "Dr. Alan Foster",
    date: "May 22, 2026",
    readTime: 5,
    image: "/news/thalassemia_pediatric_support.png",
    likes: 584,
    comments: [],
    breaking: true,
    featured: true,
  },
  {
    id: 19,
    title: "Military Blood Bank Coordination: Border Security Forces Organize Camp on Kargil Vijay Diwas",
    summary: "Border Security Forces organize a voluntary blood donation camp to support military and civil border hospital reserves.",
    content: `### BSF Kargil Vijay Diwas Camp
To commemorate Kargil Vijay Diwas, the Border Security Forces (BSF) coordinated a massive voluntary blood donation camp in association with army medical corps.

#### Supporting National Reserves
BSF personnel donated over 800 units of blood within a single day. The collected units will support military hospitals and nearby civilian healthcare centers.

#### Spirit of Service
"Donating blood is another form of service to the nation. We are proud to contribute to the health of our soldiers and citizens alike," stated the BSF Commandant.`,
    category: "Community",
    author: "James Wilson",
    date: "May 15, 2026",
    readTime: 3,
    image: "/news/military_border_security_camp.png",
    likes: 912,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 20,
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
    author: "Dr. Sarah Johnson",
    date: "May 12, 2026",
    readTime: 3,
    image: "/news/infection_vaccination_advisory.png",
    likes: 219,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 21,
    title: "ASHA Workers Trained to Screen and Motivate Voluntary Blood Donors in Uttar Pradesh",
    summary: "State health mission launches training programs for ASHA workers to drive voluntary blood donation in rural villages.",
    content: `### Empowering ASHA Workers for Blood Drives
Uttar Pradesh's State Health Mission has initiated training programs for Accredited Social Health Activists (ASHA) to promote voluntary blood donation.

#### Rural Outreach Focus
ASHA workers will be equipped with screening checklists to identify eligible healthy donors and explain the safety of voluntary donation.

#### Overcoming Superstitions
The training focuses on addressing cultural myths and fears surrounding blood donation in rural villages, laying the groundwork for mobile collection vans.`,
    category: "Community",
    author: "Priya Patel",
    date: "May 05, 2026",
    readTime: 4,
    image: "/news/asha_workers_training.png",
    likes: 476,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 22,
    title: "Rotary Club Collaborates with State Blood Council for Cold-Chain Logistics Transport Vans",
    summary: "Rotary Club donates 5 specialized refrigerated transport vans to secure regional blood transportation chains.",
    content: `### Cold-Chain Logistics Expansion
The Rotary Club has collaborated with the State Blood Council to donate 5 advanced refrigerated vans for blood product transport.

#### Specialized Climate Controls
The transport vans feature automated refrigeration units that maintain red blood cells at 2-6°C and platelets with agitation setups.

#### Serving District Networks
These vans will serve transportation routes between district-level processing hubs and rural hospital distribution banks, preventing heat-related waste.`,
    category: "Community",
    author: "James Wilson",
    date: "May 02, 2026",
    readTime: 3,
    image: "/news/cold_chain_transport_vans.png",
    likes: 312,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 23,
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
    author: "Prof. Michael Chen",
    date: "April 26, 2026",
    readTime: 4,
    image: "/news/plasma_fractionation_centre.png",
    likes: 218,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 24,
    title: "Indian Medical Association Seminar Highlights Cord Blood Banking Benefits and Ethical Guidelines",
    summary: "IMA hosts national seminar on stem cell cryopreservation, highlighting cord blood benefits and warning against private banking marketing.",
    content: `### IMA Cord Blood Banking Seminar
The Indian Medical Association (IMA) hosted a national seminar on cord blood stem cell cryopreservation, addressing ethical and clinical aspects.

#### Therapeutic Potential
Hematologists detailed how stem cells from umbilical cord blood can treat blood cancers, metabolic disorders, and immune deficiencies.

#### Public vs. Private Registries
IMA experts emphasized supporting public cord registries. "Private storage should only be recommended in specific cases with medical indications, whereas public banks provide global matching resources," the panel concluded.`,
    category: "Medical Research",
    author: "Prof. Michael Chen",
    date: "April 23, 2026",
    readTime: 5,
    image: "/news/cord_blood_banking_seminar.png",
    likes: 310,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 25,
    title: "Guinness World Record Attempt: Over 10,000 Donors Register at Single-Day Mega Camp in Bengaluru",
    summary: "NGOs and health departments coordinate a massive single-day blood drive in Bengaluru, targeting a new participation milestone.",
    content: `### Record-Breaking Blood Drive in Bengaluru
Bengaluru hosted a massive single-day voluntary blood donation camp that saw over 10,000 citizens register to donate.

#### Campaign Coordination
The drive was organized at the central exhibition grounds, featuring over 150 blood donation cots and 300 medical professionals working in shifts.

#### Strengthening Buffers
The drive successfully collected over 8,500 units, providing vital stock reserves for government hospitals across Karnataka ahead of summer.`,
    category: "Community",
    author: "James Wilson",
    date: "April 15, 2026",
    readTime: 4,
    image: "/news/bengaluru_record_mega_camp.png",
    likes: 1205,
    comments: [],
    breaking: true,
    featured: true,
  },
  {
    id: 26,
    title: "State-of-the-Art Blood Mobile Collection Unit Gifted to Jammu & Kashmir Hill Districts",
    summary: "Health department deploys an advanced all-terrain blood mobile van to serve remote valleys in Jammu & Kashmir.",
    content: `### Mobilizing Blood Collection in J&K Valleys
The Ministry of Health has deployed a custom, all-terrain blood mobile collection unit to serve remote hill districts in Jammu & Kashmir.

#### Off-Road Capabilities
The specialized heavy-duty vehicle is equipped with reinforced suspension, climate-controlled interiors, and satellite connection to access registry databases in remote locations.

#### Community Integration
The mobile van runs scheduled collection stops in coordinate with rural community centers, allowing rural residents to donate safely without traveling to urban centers.`,
    category: "Community",
    author: "James Wilson",
    date: "April 12, 2026",
    readTime: 3,
    image: "/news/jammukashmir_mobile_collection.png",
    likes: 412,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 27,
    title: "New Research Proves Efficacy of Pathogen Reduction Technology for Platelet Storage",
    summary: "Clinical researchers publish findings confirming that PRT technology extends platelet storage limits while securing safety.",
    content: `### Advancements in Platelet Storage Safety
A clinical research study published in the Medical Journal has validated Pathogen Reduction Technology (PRT) efficacy in extending platelet shelf life.

#### How PRT Works
PRT utilizes riboflavin and ultraviolet light to target and inactivate viruses, bacteria, and parasites in collected platelet units.

#### Extending Critical Shelf-life
Platelets usually expire within 5 days due to bacterial contamination risks. The research confirms PRT extends safe storage up to 7 days, reducing wastage of rare blood types.`,
    category: "Medical Research",
    author: "Dr. Alan Foster",
    date: "April 09, 2026",
    readTime: 4,
    image: "/news/pathogen_reduction_technology.png",
    likes: 289,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 28,
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
    author: "James Wilson",
    date: "April 07, 2026",
    readTime: 3,
    image: "/news/highschool_curriculum_awareness.png",
    likes: 389,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 29,
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
    author: "Robert Chen",
    date: "April 03, 2026",
    readTime: 3,
    image: "/news/eraktkosh_whatsapp_chatbot.png",
    likes: 624,
    comments: [],
    breaking: false,
    featured: false,
  },
  {
    id: 30,
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
    author: "Robert Chen",
    date: "April 01, 2026",
    readTime: 4,
    image: "/news/municipal_blood_storage_funding.png",
    likes: 310,
    comments: [],
    breaking: false,
    featured: false,
  },
];

// News Card Component
const NewsCard = ({ news, onSave, onShare, onLike }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(news.likes || 0);

  const handleSave = (e) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSave?.(news.id, newSavedState);
    toast.success(
      newSavedState ? "Saved to reading list" : "Removed from saved",
    );
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    onLike?.(news.id, newLikedState);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(news);
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Blood Donation": "bg-red-100 text-red-600",
      "Health Tips": "bg-green-100 text-green-600",
      "Medical Research": "bg-blue-100 text-blue-600",
      Community: "bg-purple-100 text-purple-600",
      Emergency: "bg-orange-100 text-orange-600",
      "Success Story": "bg-yellow-100 text-yellow-600",
      "Awareness Campaign": "bg-indigo-100 text-indigo-600",
      "Hospital Updates": "bg-teal-100 text-teal-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  return (
    <div
      onClick={() => navigate(`/news/${news.id}`)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image || FALLBACK_IMAGE}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        {news.breaking && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            BREAKING
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all ${
              isSaved
                ? "bg-red-600 text-white"
                : "bg-white/90 text-gray-600 hover:bg-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}
          >
            {news.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {news.readTime} min read
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {news.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{news.summary}</p>

        {/* Author & Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
              {news.author?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{news.author}</p>
              <p className="text-xs text-gray-500">{news.date || (news.createdAt ? new Date(news.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "June 14, 2026")}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/news/${news.id}#comments`);
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm">{Array.isArray(news.comments) ? news.comments.length : (typeof news.comments === 'number' ? news.comments : 0)}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${window.location.origin}/news/${news.id}`,
                "_blank",
              );
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-400 transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.637-12.247c.01-.383.003-.762-.02-1.14A9.93 9.93 0 0024 4.59z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Featured News Component
const FeaturedNews = ({ news }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[500px] rounded-3xl overflow-hidden group">
      <img
        src={news.image || FALLBACK_IMAGE}
        alt={news.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={(e) => {
          e.target.src = FALLBACK_IMAGE;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        {news.breaking && (
          <span className="inline-block bg-red-600 px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
            🔴 BREAKING NEWS
          </span>
        )}
        <span className="inline-block bg-red-600/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
          {news.category}
        </span>
        <h2 className="text-4xl font-bold mb-4">{news.title}</h2>
        <p className="text-lg text-gray-200 mb-6 max-w-2xl">{news.summary}</p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/news/${news.id}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Read Full Story
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
              {news.author?.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{news.author}</p>
              <p className="text-sm text-gray-300">{news.date || (news.createdAt ? new Date(news.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "June 14, 2026")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onDateRangeChange,
  onClearFilters,
  liveRequests = [],
  onNavigate,
}) => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const handleDateChange = (type, value) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-red-600" />
          Filters
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear all
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Date Range</h4>
        <div className="space-y-3">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            📰 Latest News
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            🔥 Most Popular
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            💬 Most Discussed
          </button>
        </div>
      </div>

      {/* Live Urgent Requests Widget */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-600 animate-pulse" />
          Live Urgent Needs
        </h4>
        <div className="space-y-3">
          {liveRequests.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center">No active urgent requests</p>
          ) : (
            liveRequests.map((req) => (
              <div
                key={req._id}
                onClick={() => onNavigate?.("/blood-request")}
                className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-full">
                    {req.bloodType}
                  </span>
                  <span className="text-[9px] text-red-600 uppercase font-bold tracking-wider animate-pulse font-mono">
                    {req.urgency}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-red-700">
                  {req.patientName} ({req.units} Units)
                </p>
                <p className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-red-500" />
                  {req.hospital}, {req.city}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const { id } = useParams();
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [breakingNews, setBreakingNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [viewMode, setViewMode] = useState("grid");

  // Params Detail State
  const [currentArticle, setCurrentArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Real-time Sidebar requests
  const [liveRequests, setLiveRequests] = useState([]);

  const navigate = useNavigate();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    try {
      const response = await publicApi.subscribeNewsletter(newsletterEmail);
      if (response && response.data) {
        toast.success(response.data.message || "Successfully subscribed to newsletter!");
        setNewsletterEmail("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const loadNews = useCallback(async () => {
    setLoading(true);
    const filters = {
      page: currentPage,
      category: selectedCategory,
      from: dateRange.from,
      to: dateRange.to,
      search: searchQuery,
    };

    const data = await newsApi.getAll(filters);
    if (data.news) {
      setNews(data.news);
      setTotalPages(data.totalPages || 3);

      // Set featured news from the first item if available and on first page with no filters
      if (
        currentPage === 1 &&
        !selectedCategory &&
        !dateRange.from &&
        data.news.length > 0
      ) {
        const featured = data.news.find((n) => n.featured) || data.news[0];
        setFeaturedNews(featured);
      }
    }
    setLoading(false);
  }, [currentPage, selectedCategory, dateRange, searchQuery]);

  const loadCategories = async () => {
    const data = await newsApi.getCategories();
    if (data.categories) {
      setCategories(data.categories);
    }
  };

  const loadBreakingNews = async () => {
    const data = await newsApi.getBreakingNews();
    if (data.news) {
      setBreakingNews(data.news);
    }
  };

  // Load single news detail
  const loadArticleDetail = useCallback(async () => {
    if (!id) return;
    setArticleLoading(true);
    try {
      const data = await newsApi.getById(id);
      if (data) {
        const mappedArticle = {
          ...data,
          id: data._id || data.id
        };
        setCurrentArticle(mappedArticle);
        setCommentsList(Array.isArray(mappedArticle.comments) ? mappedArticle.comments : []);
      } else {
        toast.error("News article not found");
        navigate("/news");
      }
    } catch (error) {
      console.error("Failed to load article detail:", error);
      toast.error("Error loading article details");
    } finally {
      setArticleLoading(false);
    }
  }, [id, navigate]);

  // Load live requests
  const fetchLiveRequests = async () => {
    try {
      const res = await publicApi.getBloodRequests({ status: "active" });
      if (res.data?.requests) {
        setLiveRequests(res.data.requests.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  useEffect(() => {
    loadNews();
    loadCategories();
    loadBreakingNews();
    fetchLiveRequests();
  }, [loadNews]);

  useEffect(() => {
    if (id) {
      loadArticleDetail();
    } else {
      setCurrentArticle(null);
    }
  }, [id, loadArticleDetail]);

  // Real-time socket connections
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("new-blood-request", (newReq) => {
      setLiveRequests((prev) => {
        if (prev.find((r) => r._id === newReq._id)) return prev;
        return [newReq, ...prev].slice(0, 3);
      });
      toast.success(`🩸 Live: New blood request for ${newReq.bloodType} in ${newReq.city}!`);
    });

    socket.on("news-feed-updated", () => {
      loadNews();
      loadBreakingNews();
    });

    socket.on("news-updated", (updatedInfo) => {
      if (id && updatedInfo.id === id) {
        if (updatedInfo.likes !== undefined) {
          setCurrentArticle((prev) => prev ? { ...prev, likes: updatedInfo.likes } : null);
        }
        if (updatedInfo.comments !== undefined) {
          setCommentsList(Array.isArray(updatedInfo.comments) ? updatedInfo.comments : []);
        }
      }
    });

    socket.on("new-news-article", (newNews) => {
      toast.success(`📰 News: "${newNews.title}" just published!`);
    });

    socket.on("breaking-news-alert", (newNews) => {
      toast.error(`🚨 BREAKING NEWS: "${newNews.title}" - Read Immediately!`, {
        duration: 8000
      });
      loadBreakingNews();
    });

    return () => {
      socket.disconnect();
    };
  }, [id, loadNews]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/news/${id}/comment`, { comment: newCommentText });
      if (response.status >= 200 && response.status < 300) {
        toast.success("Comment added!");
        setNewCommentText("");
        const updatedArticle = await newsApi.getById(id);
        if (updatedArticle) {
          setCommentsList(Array.isArray(updatedArticle.comments) ? updatedArticle.comments : []);
        }
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDetailLike = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to like this article");
      navigate("/login");
      return;
    }
    const success = await newsApi.likeNews(id);
    if (success) {
      setIsLiked(true);
      toast.success("Article liked!");
      const updatedArticle = await newsApi.getById(id);
      if (updatedArticle && currentArticle) {
        setCurrentArticle(prev => prev ? { ...prev, likes: updatedArticle.likes } : null);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSaveNews = async (id, saved) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to save articles");
      navigate("/login");
      return;
    }
    const success = await newsApi.saveNews(id);
    if (success) {
      toast.success(saved ? "Article saved!" : "Article removed from saved");
    } else {
      toast.error("Failed to save article");
    }
  };

  const handleLikeNews = async (id, liked) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to like articles");
      navigate("/login");
      return;
    }
    const success = await newsApi.likeNews(id);
    if (!success) {
      toast.error(
        liked ? "Failed to unlike article" : "Failed to like article",
      );
    }
  };

  const handleShareNews = (news) => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: `${window.location.origin}/news/${news.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/news/${news.id}`,
      );
      toast.success("Link copied to clipboard!");
    }
  };

  const handleExportNews = () => {
    toast.success("Exporting news list...");
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setDateRange({ from: "", to: "" });
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (id) {
    if (articleLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
          <Header />
          <div className="flex-grow flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
          <Footer />
        </div>
      );
    }

    if (!currentArticle) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
          <Header />
          <div className="flex-grow flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">News Article Not Found</h2>
            <button
              onClick={() => navigate("/news")}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to News
            </button>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
        <Header />
        
        {/* News Detail Header */}
        <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-900 to-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src={currentArticle.image || FALLBACK_IMAGE}
              alt={currentArticle.title}
              className="w-full h-full object-cover blur-sm"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <button
              onClick={() => navigate("/news")}
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to News
            </button>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                {currentArticle.category}
              </span>
              {currentArticle.breaking && (
                <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  BREAKING / IMPORTANT
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-6 leading-tight text-white">
              {currentArticle.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-red-500" />
                Reporter: <span className="font-semibold text-white">{currentArticle.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" />
                {new Date(currentArticle.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" />
                {currentArticle.readTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-red-500" />
                {currentArticle.likes * 4 + 10} views
              </div>
            </div>
          </div>
        </section>

        {/* Content & sidebar layout */}
        <div className="container mx-auto px-4 py-12 max-w-7xl flex-grow">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Article Content */}
            <div className="lg:w-3/4 bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
              <article className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                {currentArticle.image && (
                  <div className="mb-8 rounded-2xl overflow-hidden max-h-[400px]">
                    <img
                      src={currentArticle.image || FALLBACK_IMAGE}
                      alt={currentArticle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                )}
                <div className="whitespace-pre-wrap text-base md:text-lg">
                  {currentArticle.content}
                </div>
              </article>

              {/* Likes & Comments */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 py-6 my-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDetailLike}
                    disabled={isLiked}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                      isLiked
                        ? "bg-red-50 text-red-600 border border-red-200 cursor-default"
                        : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-100"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
                    {currentArticle.likes} Likes
                  </button>
                  <button
                    onClick={() => handleShareNews(currentArticle)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Article
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                  Discussion ({commentsList.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <textarea
                    rows={4}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Have an opinion? Join the discussion..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none mb-3"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Post Comment
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {commentsList.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Share your thoughts first!</p>
                  ) : (
                    commentsList.map((c, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar with Live Needs */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600 animate-pulse" />
                  Live Urgent Needs
                </h3>
                <div className="space-y-3">
                  {liveRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center">No active urgent requests</p>
                  ) : (
                    liveRequests.map((req) => (
                      <div
                        key={req._id}
                        onClick={() => navigate("/blood-request")}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-xs rounded-full">
                            {req.bloodType}
                          </span>
                          <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider animate-pulse">
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-red-700">
                          {req.patientName} ({req.units} Units)
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {req.hospital}, {req.city}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">LifeDrop News</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Blood Bank News & Updates
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Stay informed about blood donation drives, medical breakthroughs,
              and community stories that inspire change.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl group">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-transparent group-focus-within:border-red-500/30 group-focus-within:ring-4 group-focus-within:ring-red-500/10 transition-all duration-300">
                <Search className="absolute left-4 text-gray-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news articles..."
                  className="w-full pl-12 pr-32 py-4 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                />
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                      setTimeout(() => loadNews(), 10);
                    }}
                    className="absolute right-28 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600 text-white py-2 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
              <span className="bg-white text-red-600 px-2 py-1 rounded text-xs font-bold">
                BREAKING
              </span>
              {breakingNews.map((news) => (
                <button
                  key={news.id}
                  onClick={() => navigate(`/news/${news.id}`)}
                  className="hover:underline"
                >
                  {news.title} •
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onDateRangeChange={setDateRange}
              onClearFilters={clearFilters}
              liveRequests={liveRequests}
              onNavigate={navigate}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Featured News */}
            {featuredNews &&
              currentPage === 1 &&
              !selectedCategory &&
              !dateRange.from && (
                <div className="mb-12">
                  <FeaturedNews news={featuredNews} />
                </div>
              )}

            {/* View Toggle and Actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? selectedCategory : "Latest News"}
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleExportNews}
                  className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                  title="Export news"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* News Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No news found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}
              >
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    onSave={handleSaveNews}
                    onShare={handleShareNews}
                    onLike={handleLikeNews}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 py-16 relative overflow-hidden border-t border-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl" />
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg shadow-red-900/20">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Never Miss an Update
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto text-base">
              Join our community newsletter to receive real-time alerts on local blood camps, urgent drives, and medical updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={subscribing}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-500/50 text-white font-semibold rounded-xl shadow-lg shadow-red-900/30 hover:shadow-red-900/40 transition-all text-sm flex items-center justify-center gap-2 group flex-shrink-0"
              >
                {subscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              We care about your privacy. Zero spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
