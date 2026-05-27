package com.aditya.ecommerce.repo;

import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.entity.Orders;
import com.aditya.ecommerce.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Orders, Integer> {
    @Query("""
            select distinct o
            from Orders o
            left join fetch o.orderItems oi
            left join fetch oi.product p
            left join fetch o.address a
            where o.user = :user
            order by o.orderDate desc
            """)
    List<Orders> findOrdersWithItemsByUser(@Param("user") User user);

    List<Orders> findByAddress(Address address);
}
