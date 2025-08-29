# Appointment-Schedule

**Appointment-Schedule** is a web application for managing and booking appointments online. It allows users to schedule appointments based on available dates and time slots, while administrators can manage service types, days, and time configurations, as well as view the submitted registrations.

## 🧩 Main Features

- Automatic validation of availability by configured days and time slots.
- Appointment registration form requiring:
  - Full name
  - Email address
  - Phone number
- Admin panel to:
  - View appointment records with all submitted data
  - Manage available days and hours
  - Create and manage service types

## 🛠️ Technologies Used

- **Backend**: Django 5.2.5 + Django REST Framework
- **Frontend**: React (communicates via REST APIs)
- **Database**: Configurable via `dj-database-url`

## ⚙️ Python Requirements

Below are the required Python packages to run the Django backend:


You can install all dependencies by running:

```bash
pip install -r requirements.txt

git clone https://github.com/danielschez/Appointment-Schedule.git
cd appointment-schedule

python manage.py migrate
python manage.py runserver

```

📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.
