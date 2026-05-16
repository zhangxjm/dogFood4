package com.secondhand.service;

import com.secondhand.entity.User;
import com.secondhand.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return null;
        }
        user.setNickname(user.getUsername());
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        return userRepository.findByUsernameAndPassword(username, password).orElse(null);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User user) {
        User existing = userRepository.findById(id).orElse(null);
        if (existing != null) {
            if (user.getNickname() != null) existing.setNickname(user.getNickname());
            if (user.getPhone() != null) existing.setPhone(user.getPhone());
            if (user.getAvatar() != null) existing.setAvatar(user.getAvatar());
            return userRepository.save(existing);
        }
        return null;
    }
}
