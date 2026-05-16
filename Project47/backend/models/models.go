package models

import (
	"os"
	"time"

	"github.com/beego/beego/v2/client/orm"
	_ "github.com/go-sql-driver/mysql"
)

type Student struct {
	Id          int       `orm:"column(id);auto"`
	Name        string    `orm:"column(name);size(50)"`
	Gender      string    `orm:"column(gender);size(10)"`
	Phone       string    `orm:"column(phone);size(20)"`
	IdCard      string    `orm:"column(id_card);size(18)"`
	Address     string    `orm:"column(address);size(200);null"`
	EnrollDate  time.Time `orm:"column(enroll_date);type(datetime)"`
	CurrentSubject int    `orm:"column(current_subject);default(1)"`
	Status      int       `orm:"column(status);default(1)"`
	CreatedAt   time.Time `orm:"column(created_at);auto_now_add;type(datetime)"`
	UpdatedAt   time.Time `orm:"column(updated_at);auto_now;type(datetime)"`
}

type Coach struct {
	Id        int       `orm:"column(id);auto"`
	Name      string    `orm:"column(name);size(50)"`
	Gender    string    `orm:"column(gender);size(10)"`
	Phone     string    `orm:"column(phone);size(20)"`
	IdCard    string    `orm:"column(id_card);size(18)"`
	Subject   int       `orm:"column(subject)"`
	LicenseNo string    `orm:"column(license_no);size(50)"`
	Status    int       `orm:"column(status);default(1)"`
	CreatedAt time.Time `orm:"column(created_at);auto_now_add;type(datetime)"`
	UpdatedAt time.Time `orm:"column(updated_at);auto_now;type(datetime)"`
}

type Reservation struct {
	Id          int       `orm:"column(id);auto"`
	StudentId   int       `orm:"column(student_id)"`
	CoachId     int       `orm:"column(coach_id)"`
	Subject     int       `orm:"column(subject)"`
	Date        time.Time `orm:"column(date);type(date)"`
	TimeSlot    string    `orm:"column(time_slot);size(20)"`
	Status      int       `orm:"column(status);default(1)"`
	CreatedAt   time.Time `orm:"column(created_at);auto_now_add;type(datetime)"`
}

type StudyHour struct {
	Id          int       `orm:"column(id);auto"`
	StudentId   int       `orm:"column(student_id)"`
	CoachId     int       `orm:"column(coach_id)"`
	Subject     int       `orm:"column(subject)"`
	Hours       float64   `orm:"column(hours);digits(5);decimals(2)"`
	StudyDate   time.Time `orm:"column(study_date);type(date)"`
	Remark      string    `orm:"column(remark);size(200);null"`
	CreatedAt   time.Time `orm:"column(created_at);auto_now_add;type(datetime)"`
}

type ExamScore struct {
	Id          int       `orm:"column(id);auto"`
	StudentId   int       `orm:"column(student_id)"`
	Subject     int       `orm:"column(subject)"`
	Score       float64   `orm:"column(score);digits(5);decimals(2)"`
	ExamDate    time.Time `orm:"column(exam_date);type(date)"`
	IsPassed    int       `orm:"column(is_passed)"`
	Remark      string    `orm:"column(remark);size(200);null"`
	CreatedAt   time.Time `orm:"column(created_at);auto_now_add;type(datetime)"`
}

func init() {
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "123456")
	dbName := getEnv("DB_NAME", "driving_school")
	
	dsn := dbUser + ":" + dbPass + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName + "?charset=utf8mb4&loc=Local"
	orm.RegisterDataBase("default", "mysql", dsn)
	orm.RegisterModel(new(Student), new(Coach), new(Reservation), new(StudyHour), new(ExamScore))
	orm.RunSyncdb("default", false, true)
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
