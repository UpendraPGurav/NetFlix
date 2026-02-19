package com.netflix.clone.serviceImpl;

import com.netflix.clone.dao.UserRepository;
import com.netflix.clone.dao.VideoRepository;
import com.netflix.clone.dto.response.MessageResponse;
import com.netflix.clone.dto.response.PageResponse;
import com.netflix.clone.dto.response.VideoResponse;
import com.netflix.clone.entity.User;
import com.netflix.clone.entity.Video;
import com.netflix.clone.service.WatchlistService;
import com.netflix.clone.util.PaginationUtils;
import com.netflix.clone.util.ServiceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WatchlistServiceImpl implements WatchlistService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ServiceUtil serviceUtil;

    @Override
    public MessageResponse addToWatchList(String email, Long videoId) {
        User user = serviceUtil.getUserByEmailOrThrow(email);

        Video video =  serviceUtil.getVideoByIdOrThrow(videoId);

        user.addWatchList(video);
        userRepository.save(user);
        return new MessageResponse("Video has been added to watchlist successfully.");
    }

    @Override
    public MessageResponse removeFromWatchList(Long videoId, String email) {
        User user = serviceUtil.getUserByEmailOrThrow(email);
        Video video =  serviceUtil.getVideoByIdOrThrow(videoId);

        user.removeFromWatchList(video);
        userRepository.save(user);
        return new MessageResponse("Video has been removed from watchlist successfully.");
    }

    @Override
    public PageResponse<VideoResponse> getWatchlistPaginated(String email, int page, int size, String search) {
        User user = serviceUtil.getUserByEmailOrThrow(email);
        Pageable pageable = PaginationUtils.createPageRequest(page, size);
        Page<Video> videoPage;

        if(search!=null && !search.trim().isEmpty()){
            videoPage= userRepository.searchWatchlistByUserId(user.getId(),search.trim(),pageable);
        }else {
            videoPage =  userRepository.findWatchlistByUserId(user.getId(),pageable);
        }

        return PaginationUtils.toPageResponse(videoPage,VideoResponse::fromEntity);
    }
}
