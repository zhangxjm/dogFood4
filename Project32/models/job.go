package models

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Job struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Company     string    `json:"company"`
	Description string    `json:"description"`
	Salary      string    `json:"salary"`
	Location    string    `json:"location"`
	WorkTime     string    `json:"work_time"`
	Requirement string   `json:"requirement"`
	Contact     string    `json:"contact"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

var db *sql.DB

func init() {
	initDB()
}

func initDB() {
	dbPath := "./data/jobs.db"
	dir := filepath.Dir(dbPath)
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.MkdirAll(dir, 0755)
	}

	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	createTable()
}

func createTable() {
	query := `
	CREATE TABLE IF NOT EXISTS jobs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		company TEXT NOT NULL,
		description TEXT,
		salary TEXT,
		location TEXT,
		work_time TEXT,
		requirement TEXT,
		contact TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}

	seedData()
}

func seedData() {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM jobs").Scan(&count)
	if err != nil {
		return
	}

	if count == 0 {
		jobs := []Job{
			{
				Title:       "校园图书管理员兼职",
				Company:     "校园图书馆",
				Description: "负责图书整理、借还登记、书架维护等工作",
				Salary:      "15元/小时",
				Location:    "校图书馆",
				WorkTime: "每周10-15小时",
				Requirement: "细心负责，有良好的服务意识",
				Contact:     "library@school.edu.cn",
			},
			{
				Title:       "校内餐厅服务员",
				Company:     "第一食堂",
				Description: "负责餐厅清洁、餐具回收、协助打饭等工作",
				Salary:      "12元/小时 + 餐补",
				Location:    "第一食堂",
				WorkTime: "用餐高峰期",
				Requirement: "吃苦耐劳，有团队精神",
				Contact:     "canteen@school.edu.cn",
			},
			{
				Title:       "实验室助理",
				Company:     "计算机学院",
				Description: "协助教授数据录入、文档整理、设备维护",
				Salary:      "20元/小时",
				Location:    "实验楼A座",
				WorkTime: "工作日下午",
				Requirement: "计算机相关专业优先",
				Contact:     "cs_lab@school.edu.cn",
			},
		}

		for _, job := range jobs {
			CreateJob(&job)
		}
	}
}

func CreateJob(job *Job) error {
	query := `
	INSERT INTO jobs (title, company, description, salary, location, work_time, requirement, contact)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	result, err := db.Exec(query, job.Title, job.Company, job.Description, job.Salary, job.Location, job.WorkTime, job.Requirement, job.Contact)
	if err != nil {
		return err
	}
	job.ID, _ = result.LastInsertId()
	return nil
}

func GetAllJobs() ([]Job, error) {
	query := `
	SELECT id, title, company, description, salary, location, work_time, requirement, contact, created_at, updated_at
	FROM jobs ORDER BY created_at DESC
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err = rows.Scan(&job.ID, &job.Title, &job.Company, &job.Description, &job.Salary, &job.Location, &job.WorkTime, &job.Requirement, &job.Contact, &job.CreatedAt, &job.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func GetJobByID(id int64) (*Job, error) {
	query := `
	SELECT id, title, company, description, salary, location, work_time, requirement, contact, created_at, updated_at
	FROM jobs WHERE id = ?
	`
	row := db.QueryRow(query, id)
	var job Job
	err := row.Scan(&job.ID, &job.Title, &job.Company, &job.Description, &job.Salary, &job.Location, &job.WorkTime, &job.Requirement, &job.Contact, &job.CreatedAt, &job.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func UpdateJob(job *Job) error {
	query := `
	UPDATE jobs SET title=?, company=?, description=?, salary=?, location=?, work_time=?, requirement=?, contact=?, updated_at=CURRENT_TIMESTAMP
	WHERE id=?
	`
	_, err := db.Exec(query, job.Title, job.Company, job.Description, job.Salary, job.Location, job.WorkTime, job.Requirement, job.Contact, job.ID)
	return err
}

func DeleteJob(id int64) error {
	query := `DELETE FROM jobs WHERE id=?`
	_, err := db.Exec(query, id)
	return err
}
