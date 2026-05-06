# 🚀 WorkSaga — AI Job Intelligence PipelineWorkSaga is a web application that analyzes job market data using an automated pipeline built with **n8n**, external job APIs, and a frontend dashboard.It fetches job listings, processes them, stores structured data in Google Sheets, and displays insights in a clean UI.---## ✨ Features- 🔍 Search jobs by role (Frontend, Backend, DevOps, etc.)- ⚙️ Automated data pipeline using n8n- 🧠 Data structuring using JavaScript + LLM- 📊 Dynamic job listing display- 📄 Google Sheets as lightweight database- 🔗 Apply button (real link if available, otherwise Google fallback)- ⭐ Save jobs locally (browser storage)---## 🏗️ Architecture
## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
        ↓
Webhook (/job-search)
        ↓
n8n Workflow
        ↓
Job API (HTTP Request)
        ↓
Data Processing (Code + LLM)
        ↓
Google Sheets (Storage)
        ↓
Webhook (/get-jobs)
        ↓
Frontend UI
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Automation:** n8n  
- **Database:** Google Sheets  
- **APIs:** Job Search API  
- **Processing:** JavaScript + LLM  

---

## 📂 Project Structure

```
.
├── index.html
├── styles.css
├── script.js
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone repository

```bash
git clone https://github.com/your-username/worksaga.git
cd worksaga
```

---

### 2. Setup n8n Workflows

#### 🔹 Workflow 1: Job Fetch Pipeline

- Webhook → `/job-search`
- HTTP Request → Job API
- Code Nodes → Data cleaning + formatting
- Google Sheets → Append Row

#### 🔹 Workflow 2: Get Jobs API

- Webhook → `/get-jobs`
- Google Sheets → Get rows
- Respond to Webhook → JSON output

---

### 3. Configure frontend

Open `script.js` and update:

```js
const SEARCH_WEBHOOK = "YOUR_JOB_SEARCH_WEBHOOK";
const GET_WEBHOOK = "YOUR_GET_JOBS_WEBHOOK";
```

---

### 4. Run project

Open:

```
index.html
```

---

## 📊 Data Flow

1. User enters job role  
2. Frontend triggers `/job-search`  
3. n8n fetches jobs from API  
4. Data is cleaned and structured  
5. Stored in Google Sheets  
6. Frontend calls `/get-jobs`  
7. Jobs displayed in UI  

---

## ⚠️ Limitations

- Some APIs do not provide direct apply links  
  → fallback Google search is used  
- Google Sheets is used instead of a database  
- Possible duplicate entries  
- No authentication system  

---

## 🚀 Future Improvements

- Integrate API with real apply links  
- Prevent duplicates using `unique_id`  
- Add filters (Frontend / Backend / Remote)  
- Pagination and sorting  
- Replace Google Sheets with database (MongoDB / PostgreSQL)  
- Add authentication system  

---

## 📸 Demo

<img width="1897" height="977" alt="image" src="https://github.com/user-attachments/assets/5f9faeab-116f-49c0-97a1-438cfb0a546f" />


---

## 🙋‍♂️ Author

Built by **Harsh Tiwari*

---

## 📌 License

MIT License
