package com.gym.reservation.controller;

import com.gym.reservation.common.Result;
import com.gym.reservation.entity.Member;
import com.gym.reservation.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @GetMapping
    public Result<List<Member>> getAllMembers() {
        return Result.success(memberService.getAllMembers());
    }
    
    @GetMapping("/{id}")
    public Result<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
            .map(Result::success)
            .orElse(Result.error("会员不存在"));
    }
    
    @GetMapping("/phone/{phone}")
    public Result<Member> getMemberByPhone(@PathVariable String phone) {
        return memberService.getMemberByPhone(phone)
            .map(Result::success)
            .orElse(Result.error("会员不存在"));
    }
    
    @PostMapping
    public Result<Member> createMember(@Valid @RequestBody Member member) {
        try {
            return Result.success(memberService.createMember(member));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public Result<Member> updateMember(@PathVariable Long id, @Valid @RequestBody Member member) {
        try {
            return Result.success(memberService.updateMember(id, member));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteMember(@PathVariable Long id) {
        try {
            memberService.deleteMember(id);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
