package com.example.leavesystem.config;

import com.example.leavesystem.entity.User;
import com.example.leavesystem.enums.UserRole;
import com.example.leavesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
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
