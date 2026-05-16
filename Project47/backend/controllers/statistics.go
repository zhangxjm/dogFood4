package controllers

import (
	"driving-school/models"

	"github.com/beego/beego/v2/client/orm"
)

type StatisticsController struct {
	BaseController
}

// @router /dashboard [get]
func (c *StatisticsController) Dashboard() {
	o := orm.NewOrm()

	totalStudents, _ := o.QueryTable("student").Count()
	graduatedStudents, _ := o.QueryTable("student").Filter("status", 2).Count()
	studyingStudents, _ := o.QueryTable("student").Filter("status", 1).Count()

	totalCoaches, _ := o.QueryTable("coach").Count()

	todayReservations, _ := o.QueryTable("reservation").Count()

	type SubjectStats struct {
		Subject int     `json:"subject"`
		Count   int64   `json:"count"`
		AvgScore float64 `json:"avg_score"`
	}

	var subjectStats []SubjectStats
	for i := 1; i <= 4; i++ {
		count, _ := o.QueryTable("exam_score").Filter("subject", i).Count()
		var scores []models.ExamScore
		o.QueryTable("exam_score").Filter("subject", i).All(&scores)
		var total float64
		for _, s := range scores {
			total += s.Score
		}
		avg := 0.0
		if count > 0 {
			avg = total / float64(count)
		}
		subjectStats = append(subjectStats, SubjectStats{
			Subject:  i,
			Count:    count,
			AvgScore: avg,
		})
	}

	c.Success(map[string]interface{}{
		"totalStudents":      totalStudents,
		"graduatedStudents": graduatedStudents,
		"studyingStudents":  studyingStudents,
		"totalCoaches":       totalCoaches,
		"todayReservations":  todayReservations,
		"subjectStats":        subjectStats,
	})
}

// @router /graduated-monthly [get]
func (c *StatisticsController) GraduatedMonthly() {
	o := orm.NewOrm()

	type MonthlyData struct {
		Month string `json:"month"`
		Count int64  `json:"count"`
	}

	var result []MonthlyData

	var students []models.Student
	o.QueryTable("student").Filter("status", 2).All(&students)

	monthMap := make(map[string]int64)
	for _, s := range students {
		month := s.EnrollDate.Format("2006-01")
		monthMap[month]++
	}

	for month, count := range monthMap {
		result = append(result, MonthlyData{
			Month: month,
			Count: count,
		})
	}

	c.Success(result)
}

// @router /pass-rate [get]
func (c *StatisticsController) PassRate() {
	o := orm.NewOrm()

	type PassRateData struct {
		Subject int     `json:"subject"`
		Total   int64   `json:"total"`
		Passed  int64   `json:"passed"`
		Rate    float64 `json:"rate"`
	}

	var result []PassRateData

	for i := 1; i <= 4; i++ {
		total, _ := o.QueryTable("exam_score").Filter("subject", i).Count()
		passed, _ := o.QueryTable("exam_score").Filter("subject", i).Filter("is_passed", 1).Count()
		rate := 0.0
		if total > 0 {
			rate = float64(passed) / float64(total) * 100
		}
		result = append(result, PassRateData{
			Subject: i,
			Total:   total,
			Passed:  passed,
			Rate:    rate,
		})
	}

	c.Success(result)
}
