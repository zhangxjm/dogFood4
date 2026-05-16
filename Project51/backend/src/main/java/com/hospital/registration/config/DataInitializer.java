package com.hospital.registration.config;

import com.hospital.registration.entity.Department;
import com.hospital.registration.entity.Doctor;
import com.hospital.registration.repository.DepartmentRepository;
import com.hospital.registration.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0) {
            Department dept1 = new Department();
            dept1.setName("内科");
            dept1.setDescription("内科诊疗中心");
            dept1.setSortOrder(1);
            dept1.setStatus(true);

            Department dept2 = new Department();
            dept2.setName("外科");
            dept2.setDescription("外科诊疗中心");
            dept2.setSortOrder(2);
            dept2.setStatus(true);

            Department dept3 = new Department();
            dept3.setName("儿科");
            dept3.setDescription("儿科诊疗中心");
            dept3.setSortOrder(3);
            dept3.setStatus(true);

            Department dept4 = new Department();
            dept4.setName("妇产科");
            dept4.setDescription("妇产科诊疗中心");
            dept4.setSortOrder(4);
            dept4.setStatus(true);

            Department dept5 = new Department();
            dept5.setName("骨科");
            dept5.setDescription("骨科诊疗中心");
            dept5.setSortOrder(5);
            dept5.setStatus(true);

            departmentRepository.saveAll(Arrays.asList(dept1, dept2, dept3, dept4, dept5));

            Doctor doc1 = new Doctor();
            doc1.setName("张医生");
            doc1.setDepartment(dept1);
            doc1.setTitle("主任医师");
            doc1.setSpecialty("擅长心血管疾病、呼吸系统疾病诊治");
            doc1.setStatus(true);

            Doctor doc2 = new Doctor();
            doc2.setName("李医生");
            doc2.setDepartment(dept1);
            doc2.setTitle("副主任医师");
            doc2.setSpecialty("擅长消化系统疾病、内分泌疾病诊治");
            doc2.setStatus(true);

            Doctor doc3 = new Doctor();
            doc3.setName("王医生");
            doc3.setDepartment(dept2);
            doc3.setTitle("主任医师");
            doc3.setSpecialty("擅长普外科手术、腹腔镜手术");
            doc3.setStatus(true);

            Doctor doc4 = new Doctor();
            doc4.setName("赵医生");
            doc4.setDepartment(dept2);
            doc4.setTitle("主治医师");
            doc4.setSpecialty("擅长微创手术、创伤外科");
            doc4.setStatus(true);

            Doctor doc5 = new Doctor();
            doc5.setName("刘医生");
            doc5.setDepartment(dept3);
            doc5.setTitle("副主任医师");
            doc5.setSpecialty("擅长小儿呼吸系统、消化系统疾病");
            doc5.setStatus(true);

            doctorRepository.saveAll(Arrays.asList(doc1, doc2, doc3, doc4, doc5));

            System.out.println("==================================");
            System.out.println("测试数据初始化完成！");
            System.out.println("已插入5个科室和5位医生");
            System.out.println("==================================");
        }
    }
}
