import java.util.*;

public class LearningMaterial {
    private String id;
    private String title;
    private String description;
    private Object content;
    private MaterialType type;
    private Difficulty difficulty;
    private List<String> tags;
    private Boolean isPublished;
    private Date createdAt;
    private Date updatedAt;
    private List<LearningProgress> progress;
}
