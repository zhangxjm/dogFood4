package com.example.leavesystem.service;

import com.example.leavesystem.entity.LeaveApplication;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] exportLeaveApplications(List<LeaveApplication> leaves) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("请假记录");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);

            String[] headers = {
                "序号", "学生姓名", "班级", "请假类型", "开始日期", 
                "结束日期", "请假天数", "请假原因", "状态", 
                "一级审批人", "一级审批意见", "一级审批时间",
                "二级审批人", "二级审批意见", "二级审批时间", "申请时间"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (LeaveApplication leave : leaves) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, rowNum - 1, dataStyle);
                createCell(row, colNum++, leave.getStudent().getName(), dataStyle);
                createCell(row, colNum++, leave.getStudent().getClassName(), dataStyle);
                createCell(row, colNum++, leave.getLeaveType().getDescription(), dataStyle);
                createCell(row, colNum++, leave.getStartDate() != null ? 
                    leave.getStartDate().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, colNum++, leave.getEndDate() != null ? 
                    leave.getEndDate().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, colNum++, leave.getDays(), dataStyle);
                createCell(row, colNum++, leave.getReason(), dataStyle);
                createCell(row, colNum++, leave.getStatus().getDescription(), dataStyle);
                createCell(row, colNum++, leave.getFirstApprover() != null ? 
                    leave.getFirstApprover().getName() : "", dataStyle);
                createCell(row, colNum++, leave.getFirstApproveComment() != null ? 
                    leave.getFirstApproveComment() : "", dataStyle);
                createCell(row, colNum++, leave.getFirstApproveTime() != null ? 
                    leave.getFirstApproveTime().format(DATE_TIME_FORMATTER) : "", dataStyle);
                createCell(row, colNum++, leave.getSecondApprover() != null ? 
                    leave.getSecondApprover().getName() : "", dataStyle);
                createCell(row, colNum++, leave.getSecondApproveComment() != null ? 
                    leave.getSecondApproveComment() : "", dataStyle);
                createCell(row, colNum++, leave.getSecondApproveTime() != null ? 
                    leave.getSecondApproveTime().format(DATE_TIME_FORMATTER) : "", dataStyle);
                createCell(row, colNum++, leave.getCreatedAt() != null ? 
                    leave.getCreatedAt().format(DATE_TIME_FORMATTER) : "", dataStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(currentWidth, 3000));
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setWrapText(true);
        return style;
    }

    private void createCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value.toString());
        }
        cell.setCellStyle(style);
    }
}
