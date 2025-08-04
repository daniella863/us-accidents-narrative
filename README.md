# us-accidents-narrative

Narrative Visualization Essay
The goal of this narrative is to uncover patterns and insights in traffic accidents across the Southwest United States from 2018 onward. By visualizing spatial, temporal, and geographic distributions, the visualization aims to help users understand where and when accidents most frequently occur, and which cities are most at risk. The messaging highlights that:
•	Accidents are concentrated in specific states and cities
•	There's a clear spike in accidents during peak driving hours
•	Temperature and time-of-day influence accident trends
•	Certain cities experience significantly higher accident rates than others
The ultimate message is to raise awareness about accident frequency trends in the Southwest region of the United States, which includes Arizona, Colorado, California, Texas, New Mexico, Oklahoma, Nevada, and Utah. This message also offers data-driven perspectives for policymaking, road safety improvements, and citizen awareness.
The narrative structure of the project follows the interactive slideshow narrative structure. Each scene is presented one at a time, guiding the user through the data step-by-step. Users can control the flow via Next and Previous buttons at the bottom, allowing exploration at each step. In the final scene (Scene 4), the user can interact with a dropdown menu to explore different states and see which cities have the most accidents, which adds a layer of personal exploration to the guided story. This structure encourages active learning, allowing users to interpret insights scene by scene while giving them freedom to explore comparisons in the final scene.
The visual structure is laid out that each scene uses a consistent visual structure where:
•	A centered title introduces the chart's theme.
•	A bar chart or histogram is used in each case, maintaining visual familiarity.
•	Axes, labels, and tick marks are clearly presented to ensure interpretability.
•	Annotations highlight key trends directly on the charts without requiring user interaction.
Transitions between scenes are managed by clearing the SVG container and redrawing the new chart, ensuring clarity without clutter. The approach helps the viewer understand one message at a time, maintain focus on key findings, compare patterns across scenes as they progress through the slideshow.
There are four main scenes in this narrative which are the following:
1.	Scene 1 – Accidents by State
A bar chart shows total accidents in each Southwest state. This introduces the audience to the regional scope and lets them identify the most accident-prone states.
2.	Scene 2 – Hourly Distribution of Accidents
A bar chart breaks down accidents by hour of day, revealing clear spikes during rush hour times. This answers “When do accidents happen most?”
3.	Scene 3 – Accident Frequency by Temperature
A histogram explores how accident frequency correlates with ambient temperature, providing environmental context.
4.	Scene 4 – Top Cities in Each State
A dropdown lets users select a state and see the 10 cities with the highest number of accidents. This interactive scene allows deeper geographic drilling and personalized insight.
Scenes are ordered from broad to specific, aligning with how users typically build understanding—first the overall picture, then patterns, and finally detailed local information.
The annotations in the project use a consistent annotation template built with d3-annoation. Annotations appear in the top-right or near data peaks, contain a bold title and a smaller label, include a line connecting the label to the relevant chart element, and they don’t rely on hover since they are always visible to the user. An example is how in Scene 2, an annotation points to the 5 pm spike with the title “Rush Hour Spike” and label “Highest number of accidents at 17:00”. In Scene 4, the top city bar includes an annotation that changes depending docus on important insights. The annotation style reinforces the message and helps users quickly focus on important insights without additional effort or exploration.
The primary parameter in the narrative visualization is currentScene, which tracks the active scene number (0 through 4). This parameter controls which scene function to invoke from the script.js. It also updates the display and annotation logic dynamically and resets the SVG element before redrawing. In Scene 4, a second parameter, selectedState, defines which state is active in the dropdown and determines which cities are shown. This parameter filters the dataset in real-time and drives the dynamic annotation for the top city. Each scene is defined by the state of these parameters, which ensures consistency and logical flow. 
The triggers in the project are UI controls and dropdown selections. The Next and Previous buttons trigger change to currectScene, which updates the HTML DOM and scene content. In Scene 4, changing the dropdown triggers an update to SelectedState, filtering the data and redrawing the chard. These UI elements are clearly visible and consistently placed. The dropdown appears only in Scene 4, using the style.display = ‘block’ to indicate new functionality. The trigger provide clear affordances since the buttons encourage the users to move through the story, while the dropdown encourages interaction and exploration of different Southwest states.
In conclusion, this narrative visualization demonstrates an intentional blend of storytelling and interactivity. The interactive slideshow structure guides users through a data-driven narrative while allowing meaningful exploration at the end. Consistent visuals and annotations support comprehension, and parameterized logic and triggers provide the interactivity expected of modern data storytelling.
