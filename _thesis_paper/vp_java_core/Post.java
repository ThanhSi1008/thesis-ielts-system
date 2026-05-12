import java.util.*;

public class Post {
    private String id;
    private String authorId;
    private PostType type;
    private String title;
    private String body;
    private List<String> imageUrls;
    private List<String> tags;
    private Object metadata;
    private Integer likeCount;
    private Integer commentCount;
    private Integer bookmarkCount;
    private Boolean isPinned;
    private Boolean isHidden;
    private Date createdAt;
    private Date updatedAt;
    private User author;
    private List<Comment> comments;
    private List<PostLike> likes;
    private List<PostBookmark> bookmarks;
}
