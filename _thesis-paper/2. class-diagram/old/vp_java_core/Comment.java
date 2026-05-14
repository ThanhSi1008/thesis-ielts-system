import java.util.*;

public class Comment {
    private String id;
    private String postId;
    private String authorId;
    private String parentId;
    private String body;
    private Boolean isHidden;
    private Date createdAt;
    private Date updatedAt;
    private Post post;
    private User author;
    private Comment parent;
    private List<Comment> replies;
}
