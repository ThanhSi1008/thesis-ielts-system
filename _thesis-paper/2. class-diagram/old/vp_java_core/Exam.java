import java.util.*;

public class Exam {
    private String id;
    private String title;
    private String description;
    private String imageUrl;
    private Integer duration;
    private ExamType type;
    private Difficulty difficulty;
    private Boolean isPublished;
    private Object questions;
    private Date createdAt;
    private Date updatedAt;
    private List<ExamSession> sessions;
}
