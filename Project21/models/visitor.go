package models

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	beego "github.com/beego/beego/v2/server/web"
	_ "github.com/go-sql-driver/mysql"
)

type Visitor struct {
	Id        int64  `orm:"auto" json:"id"`
	Name      string `orm:"size(50)" json:"name"`
	Phone     string `orm:"size(20)" json:"phone"`
	Purpose   string `orm:"size(200)" json:"purpose"`
	VisitTime string `json:"visit_time"`
	CreatedAt string `json:"created_at"`
}

var db *sql.DB

func InitDB() {
	mysqlUser, _ := beego.AppConfig.String("mysqluser")
	mysqlPass, _ := beego.AppConfig.String("mysqlpass")
	mysqlHost, _ := beego.AppConfig.String("mysqlhost")
	mysqlPort, _ := beego.AppConfig.String("mysqlport")
	mysqlDb, _ := beego.AppConfig.String("mysqldb")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		mysqlUser, mysqlPass, mysqlHost, mysqlPort, mysqlDb)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("连接数据库失败:", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	if err = db.Ping(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	log.Println("数据库连接成功")
}

func AddVisitor(name, phone, purpose string) (int64, error) {
	result, err := db.Exec(
		"INSERT INTO visitors (name, phone, purpose, visit_time) VALUES (?, ?, ?, ?)",
		name, phone, purpose, time.Now().Format("2006-01-02 15:04:05"),
	)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func GetAllVisitors() ([]Visitor, error) {
	rows, err := db.Query(
		"SELECT id, name, phone, purpose, visit_time, created_at FROM visitors ORDER BY id DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var visitors []Visitor
	for rows.Next() {
		var v Visitor
		var visitTime, createdAt time.Time
		if err := rows.Scan(&v.Id, &v.Name, &v.Phone, &v.Purpose, &visitTime, &createdAt); err != nil {
			continue
		}
		v.VisitTime = visitTime.Format("2006-01-02 15:04:05")
		v.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		visitors = append(visitors, v)
	}
	return visitors, nil
}

func SearchVisitors(keyword string) ([]Visitor, error) {
	rows, err := db.Query(
		"SELECT id, name, phone, purpose, visit_time, created_at FROM visitors WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC",
		"%"+keyword+"%", "%"+keyword+"%",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var visitors []Visitor
	for rows.Next() {
		var v Visitor
		var visitTime, createdAt time.Time
		if err := rows.Scan(&v.Id, &v.Name, &v.Phone, &v.Purpose, &visitTime, &createdAt); err != nil {
			continue
		}
		v.VisitTime = visitTime.Format("2006-01-02 15:04:05")
		v.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		visitors = append(visitors, v)
	}
	return visitors, nil
}
