package com.example.leavesystem.config;

import com.example.leavesystem.entity.LeaveTypeConfig;
import com.example.leavesystem.entity.User;
import com.example.leavesystem.enums.UserRole;
import com.example.leavesystem.repository.LeaveTypeConfigRepository;
import com.example.leavesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveTypeConfigRepository leaveTypeConfigRepository;

    @Override
    public void run(String... args) throws Exception {
        if (leaveTypeConfigRepository.count() == 0) {
            LeaveTypeConfig sickLeave = new LeaveTypeConfig();
            sickLeave.setTypeCode("SICK");
            sickLeave.setTypeName("病假");
            sickLeave.setDescription("因病请假");
            sickLeave.setEnabled(true);
            leaveTypeConfigRepository.save(sickLeave);

            LeaveTypeConfig personalLeave = new LeaveTypeConfig();
            personalLeave.setTypeCode("PERSONAL");
            personalLeave.setTypeName("事假");
            personalLeave.setDescription("因个人事务请假");
            personalLeave.setEnabled(true);
            leaveTypeConfigRepository.save(personalLeave);

            LeaveTypeConfig annualLeave = new LeaveTypeConfig();
            annualLeave.setTypeCode("ANNUAL");
            annualLeave.setTypeName("年假");
            annualLeave.setDescription("年度带薪休假");
            annualLeave.setEnabled(true);
            leaveTypeConfigRepository.save(annualLeave);

            LeaveTypeConfig officialLeave = new LeaveTypeConfig();
            officialLeave.setTypeCode("OFFICIAL");
            officialLeave.setTypeName("公假");
            officialLeave.setDescription("因公事请假");
            officialLeave.setEnabled(true);
            leaveTypeConfigRepository.save(officialLeave);

            LeaveTypeConfig maternityLeave = new LeaveTypeConfig();
            maternityLeave.setTypeCode("MATERNITY");
            maternityLeave.setTypeName("产假");
            maternityLeave.setDescription("产假");
            maternityLeave.setEnabled(true);
            leaveTypeConfigRepository.save(maternityLeave);

            LeaveTypeConfig otherLeave = new LeaveTypeConfig();
            otherLeave.setTypeCode("OTHER");
            otherLeave.setTypeName("其他");
            otherLeave.setDescription("其他原因请假");
            otherLeave.setEnabled(true);
            leaveTypeConfigRepository.save(otherLeave);

            System.out.println("初始化请假类型完成！");
        }

        if (userRepository.count() == 0) {
            User student1 = new User();
            student1.setUsername("student1");
            student1.setPassword("123456");
            student1.setName("张三");
            student1.setRole(UserRole.STUDENT);
            student1.setClassName("计算机1班");
            userRepository.save(student1);

            User student2 = new User();
            student2.setUsername("student2");
            student2.setPassword("123456");
            student2.setName("李四");
            student2.setRole(UserRole.STUDENT);
            student2.setClassName("计算机1班");
            userRepository.save(student2);

            User student3 = new User();
            student3.setUsername("student3");
            student3.setPassword("123456");
            student3.setName("王五");
            student3.setRole(UserRole.STUDENT);
            student3.setClassName("计算机2班");
            userRepository.save(student3);

            User teacher1 = new User();
            teacher1.setUsername("teacher1");
            teacher1.setPassword("123456");
            teacher1.setName("李老师");
            teacher1.setRole(UserRole.TEACHER_FIRST);
            userRepository.save(teacher1);

            User teacher2 = new User();
            teacher2.setUsername("teacher2");
            teacher2.setPassword("123456");
            teacher2.setName("王主任");
            teacher2.setRole(UserRole.TEACHER_SECOND);
            userRepository.save(teacher2);

            System.out.println("======================================");
            System.out.println("初始化数据完成！");
            System.out.println("学生账号: student1 / 123456 (计算机1班)");
            System.out.println("学生账号: student2 / 123456 (计算机1班)");
            System.out.println("学生账号: student3 / 123456 (计算机2班)");
            System.out.println("一级审批: teacher1 / 123456");
            System.out.println("二级审批: teacher2 / 123456");
            System.out.println("======================================");
        }
    }
}
