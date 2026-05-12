import java.util.*;

public class IeltsBasicWritingExercise {
    private String id;
    private String skillId;
    private String lessonId;
    private String topic;
    private String instructions;
    private String prompt;
    private String diagramUrl;
    private Object modelAnswer;
    private Integer order;
    private Integer taskType;
    private Date createdAt;
    private Date updatedAt;
    private IeltsBasicSkill skill;
    private IeltsBasicLesson lesson;
    private List<IeltsBasicProgress> progress;
    private List<IeltsBasicWritingAnswer> userAnswers;
}
