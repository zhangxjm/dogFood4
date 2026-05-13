package com.foodorder.repository;

import com.foodorder.entity.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {
    Optional<TableEntity> findByTableNo(String tableNo);
    boolean existsByTableNo(String tableNo);
}
