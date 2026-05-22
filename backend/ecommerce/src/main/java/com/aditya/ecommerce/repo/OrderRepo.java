package com.aditya.ecommerce.repo;

import com.aditya.ecommerce.entity.Orders;
import com.aditya.ecommerce.entity.User;
import org.aspectj.weaver.ast.Or;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Orders, Integer> {
    List<Orders> findByUser(User user);
}
