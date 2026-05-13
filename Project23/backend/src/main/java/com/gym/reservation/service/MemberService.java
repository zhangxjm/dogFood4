package com.gym.reservation.service;

import com.gym.reservation.entity.Member;
import com.gym.reservation.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }
    
    public Optional<Member> getMemberByPhone(String phone) {
        return memberRepository.findByPhone(phone);
    }
    
    @Transactional
    public Member createMember(Member member) {
        if (memberRepository.existsByPhone(member.getPhone())) {
            throw new RuntimeException("该手机号已注册");
        }
        return memberRepository.save(member);
    }
    
    @Transactional
    public Member updateMember(Long id, Member memberDetails) {
        return memberRepository.findById(id)
            .map(member -> {
                member.setName(memberDetails.getName());
                if (memberDetails.getPhone() != null && 
                    !member.getPhone().equals(memberDetails.getPhone())) {
                    if (memberRepository.existsByPhone(memberDetails.getPhone())) {
                        throw new RuntimeException("该手机号已注册");
                    }
                    member.setPhone(memberDetails.getPhone());
                }
                return memberRepository.save(member);
            })
            .orElseThrow(() -> new RuntimeException("会员不存在"));
    }
    
    @Transactional
    public void deleteMember(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new RuntimeException("会员不存在");
        }
        memberRepository.deleteById(id);
    }
}
