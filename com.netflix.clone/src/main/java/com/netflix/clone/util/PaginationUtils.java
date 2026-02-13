package com.netflix.clone.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PaginationUtils {

    private PaginationUtils(){

    }
    public static Pageable createPageRequest(int page, int size, String sortBy){
       return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
    }
}
