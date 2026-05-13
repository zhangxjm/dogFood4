package utils

import "github.com/gin-gonic/gin"

func SuccessResponse(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{
		"code": 0,
		"msg":  "success",
		"data": data,
	})
}

func ErrorResponse(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{
		"code": 1,
		"msg":  msg,
	})
}
