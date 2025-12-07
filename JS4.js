/* Weekly Routine Generator - Fixed with proper theory allocation logic */
let teachers = []; // { id, name, subject, code, classType, weeklyFrequency }

// ---------- Teacher UI / Management ----------

5


function addTeacher() {
    const name = document.getElementById("teacherName").value.trim();
    const subject = document.getElementById("subjectName").value.trim();
    const code = document.getElementById("subjectCode").value.trim();
    const classType = document.getElementById("classType").value;
    const weeklyFrequency = parseInt(document.getElementById("classesPerWeek").value, 10);

    if (!name || !subject || !code) {
        alert("Please enter teacher name, subject, and subject code.");
        return;
    }

    if (weeklyFrequency < 1 || weeklyFrequency > 5) {
        alert("Weekly frequency must be between 1 and 5.");
        return;
    }

    // Check if subject already exists with different type
    const existingSubject = teachers.find(t => t.subject === subject);
    if (existingSubject && existingSubject.classType !== classType) {
        alert(`Subject "${subject}" already exists as ${existingSubject.classType} type. Please use the same type.`);
        return;
    }

    // Add teacher
    teachers.push({
        id: teachers.length, 
        name, 
        subject, 
        code, 
        classType,
        weeklyFrequency
    });

    // Reset inputs
    document.getElementById("teacherName").value = "";
    document.getElementById("subjectName").value = "";
    document.getElementById("subjectCode").value = "";

    renderTeacherList();
    alert(`Teacher added! Subject: ${subject}, Type: ${classType}, Weekly frequency: ${weeklyFrequency} classes`);
}

// NEW: Function to automatically set weekly frequency to 1 when Practical is selected
function updateWeeklyFrequency() {
    const classType = document.getElementById("classType").value;
    const weeklyFrequencySelect = document.getElementById("classesPerWeek");
    
    if (classType === "Practical") {
        // Set to "1 class per week" when Practical is selected
        weeklyFrequencySelect.value = "1";
        // Disable the dropdown for practical classes
        weeklyFrequencySelect.disabled = true;
    } else {
        // Enable the dropdown and set default to 3 for Theory
        weeklyFrequencySelect.disabled = false;
        weeklyFrequencySelect.value = "3";
    }
}

// Add event listener to class type dropdown
document.addEventListener('DOMContentLoaded', function() {
    const classTypeSelect = document.getElementById("classType");
    if (classTypeSelect) {
        classTypeSelect.addEventListener('change', updateWeeklyFrequency);
    }
});

function normalizeTeacherIds() {
    for (let i = 0; i < teachers.length; i++) teachers[i].id = i;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toggleTeacherList() {
    const box = document.getElementById("teacherList");
    if (!box) return;
    if (box.style.display === "block") {
        box.style.display = "none";
        document.getElementById("toggleTeacherList").textContent = "Show Teachers";
    } else {
        renderTeacherList();
        box.style.display = "block";
        document.getElementById("toggleTeacherList").textContent = "Hide Teachers";
    }
}

function renderTeacherList() {
    const container = document.getElementById("teacherList");
    if (!container) return;
    container.innerHTML = "";

    if (teachers.length === 0) {
        container.innerHTML = "<em>No teachers added yet.</em>";
        return;
    }

    teachers.forEach((t, idx) => {
        const card = document.createElement("div");
        card.className = "teacher-card";
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(t.name)}</strong>
                <div>
                    <button class="edit-btn" onclick="startEdit(${idx})">Edit</button>
                    <button onclick="deleteTeacher(${idx})">Delete</button>
                </div>
            </div>
            <div id="view-${idx}">
                <div><b>Subject:</b> ${escapeHtml(t.subject)}</div>
                <div><b>Code:</b> ${escapeHtml(t.code)}</div>
                <div><b>Type:</b> ${escapeHtml(t.classType)}</div>
                <div><b>Weekly Frequency:</b> ${escapeHtml(t.weeklyFrequency)} classes</div>
            </div>
            <div id="edit-${idx}" style="display:none;margin-top:8px;">
                <label>Name</label>
                <input type="text" id="edit-name-${idx}" value="${escapeHtml(t.name)}">
                <label>Subject</label>
                <input type="text" id="edit-subject-${idx}" value="${escapeHtml(t.subject)}">
                <label>Subject Code</label>
                <input type="text" id="edit-code-${idx}" value="${escapeHtml(t.code)}">
                <label>Class Type</label>
                <select id="edit-type-${idx}">
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                </select>
                <label>Weekly Frequency</label>
                <select id="edit-frequency-${idx}" ${t.classType === "Practical" ? 'disabled' : ''}>
                    <option value="1">1 class per week</option>
                    <option value="2">2 classes per week</option>
                    <option value="3">3 classes per week</option>
                    <option value="4">4 classes per week</option>
                    <option value="5">5 classes per week</option>
                </select>
                <div style="margin-top:8px;display:flex;gap:8px;">
                    <button onclick="saveEdit(${idx})">Save</button>
                    <button onclick="cancelEdit(${idx})">Cancel</button>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Set edit form values
        const typeSelect = document.getElementById(`edit-type-${idx}`);
        const freqSelect = document.getElementById(`edit-frequency-${idx}`);
        if (typeSelect) typeSelect.value = t.classType;
        if (freqSelect) {
            freqSelect.value = t.weeklyFrequency;
            // Disable frequency dropdown for practical classes in edit mode
            if (t.classType === "Practical") {
                freqSelect.disabled = true;
            }
        }
        
        // Add event listener to edit mode class type dropdown
        if (typeSelect) {
            typeSelect.addEventListener('change', function() {
                const editFreqSelect = document.getElementById(`edit-frequency-${idx}`);
                if (this.value === "Practical") {
                    editFreqSelect.value = "1";
                    editFreqSelect.disabled = true;
                } else {
                    editFreqSelect.disabled = false;
                    if (!editFreqSelect.value || editFreqSelect.value === "1") {
                        editFreqSelect.value = "3";
                    }
                }
            });
        }
    });
}

function startEdit(index) {
    const view = document.getElementById(`view-${index}`);
    const edit = document.getElementById(`edit-${index}`);
    if (view) view.style.display = "none";
    if (edit) edit.style.display = "block";
}

function cancelEdit(index) {
    const view = document.getElementById(`view-${index}`);
    const edit = document.getElementById(`edit-${index}`);
    if (view) view.style.display = "block";
    if (edit) edit.style.display = "none";
}

function saveEdit(index) {
    const name = document.getElementById(`edit-name-${index}`).value.trim();
    const subject = document.getElementById(`edit-subject-${index}`).value.trim();
    const code = document.getElementById(`edit-code-${index}`).value.trim();
    const type = document.getElementById(`edit-type-${index}`).value;
    const frequency = parseInt(document.getElementById(`edit-frequency-${index}`).value, 10);

    if (!name || !subject || !code) {
        alert("Please fill name, subject and code.");
        return;
    }

    if (frequency < 1 || frequency > 5) {
        alert("Weekly frequency must be between 1 and 5.");
        return;
    }

    // Check if subject already exists with different type (excluding current teacher)
    const existingSubject = teachers.find((t, i) => i !== index && t.subject === subject);
    if (existingSubject && existingSubject.classType !== type) {
        alert(`Subject "${subject}" already exists as ${existingSubject.classType} type. Please use the same type.`);
        return;
    }

    teachers[index].name = name;
    teachers[index].subject = subject;
    teachers[index].code = code;
    teachers[index].classType = type;
    teachers[index].weeklyFrequency = frequency;

    normalizeTeacherIds();
    renderTeacherList();
}

function deleteTeacher(index) {
    if (!confirm("Delete this teacher?")) return;
    teachers.splice(index, 1);
    normalizeTeacherIds();
    renderTeacherList();
}

// ---------- Helpers for scheduling ----------

function formatTime(h, m) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateAllowedSlots(dayStart, dayEnd) {
    const base = 9 * 60;
    const interval = 40;
    const slots = [];
    for (let t = base; t <= dayEnd; t += interval) {
        if (t >= dayStart) slots.push(t);
    }
    return slots;
}

// ---------- NEW: Fixed Theory Allocation Logic ----------

function allocateTheoryClass(dayInfo, days, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap, teacherAllocationCount) {
    const dayOrder = [0, 2, 4, 1, 3]; // Monday, Wednesday, Friday, Tuesday, Thursday
    
    // First class: Try Monday, Wednesday, Friday
    if (teacherAllocationCount[theoryTeacher.id] === 0) {
        for (let dayIdx of [0, 2, 4]) { // Mon, Wed, Fri
            if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                return true;
            }
        }
        
        // If not placed in first pattern, try any available day
        for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
            if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                return true;
            }
        }
    }
    
    // Second class: Try Tuesday, Thursday
    else if (teacherAllocationCount[theoryTeacher.id] === 1) {
        for (let dayIdx of [1, 3]) { // Tue, Thu
            if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                return true;
            }
        }
        
        // Week is over, check from start of week for free time
        for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
            // Skip days where this subject already has class
            if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === theoryTeacher.subject)) {
                continue;
            }
            
            if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                return true;
            }
        }
    }
    
    // Third and subsequent classes: Check in order
    else {
        // Try to find any available day
        for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
            // Skip days where this subject already has class
            if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === theoryTeacher.subject)) {
                continue;
            }
            
            if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                return true;
            }
        }
    }
    
    return false;
}

function canPlaceTheoryOnDay(dayInfo, dayIdx, teacher, duration, dailyClassTime, subjectAllocationMap) {
    // Check if subject already on this day
    if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === teacher.subject)) {
        return false;
    }
    
    // Check if day has enough free time
    if (dayInfo[dayIdx].allocatedMinutes + duration > dailyClassTime) {
        return false;
    }
    
    // Check if teacher already has maximum weekly frequency
    const subjectProgress = subjectAllocationMap[teacher.subject];
    if (subjectProgress && subjectProgress.current >= subjectProgress.target) {
        return false;
    }
    
    return true;
}

function placeClassOnDay(dayInfo, dayIdx, teacher, duration, subjectAllocationMap, teacherAllocationCount) {
    dayInfo[dayIdx].classes.push({ 
        teacher: teacher, 
        duration: duration,
        type: teacher.classType
    });
    dayInfo[dayIdx].allocatedMinutes += duration;
    
    // Update subject allocation
    if (!subjectAllocationMap[teacher.subject]) {
        subjectAllocationMap[teacher.subject] = { target: teacher.weeklyFrequency, current: 0 };
    }
    subjectAllocationMap[teacher.subject].current++;
    
    // Update teacher allocation count
    if (!teacherAllocationCount[teacher.id]) {
        teacherAllocationCount[teacher.id] = 0;
    }
    teacherAllocationCount[teacher.id]++;
}

// ---------- NEW: Fixed Practical Allocation Logic ----------

function allocatePracticalClass(dayInfo, days, practicalTeacher, prDur, dailyClassTime, subjectAllocationMap, teacherAllocationCount, lastPracticalDay) {
    const dayCount = days.length;
    
    // Start from the day after the last practical placement
    let startDay = (lastPracticalDay[practicalTeacher.subject] + 1) % dayCount;
    
    // Try to place in sequence: Monday -> Tuesday -> Wednesday -> Thursday -> Friday -> Monday...
    for (let attempt = 0; attempt < dayCount; attempt++) {
        const dayIdx = (startDay + attempt) % dayCount;
        
        // Check if subject already on this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === practicalTeacher.subject)) {
            continue;
        }
        
        // Check if teacher already has class this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.id === practicalTeacher.id)) {
            continue;
        }
        
        // Calculate free time for the day
        const freeTime = dailyClassTime - dayInfo[dayIdx].allocatedMinutes;
        
        // Check if free time is at least half of practical duration
        if (freeTime >= Math.floor(prDur / 2)) {
            // Check if we can actually fit the practical
            if (dayInfo[dayIdx].allocatedMinutes + prDur <= dailyClassTime) {
                placeClassOnDay(dayInfo, dayIdx, practicalTeacher, prDur, subjectAllocationMap, teacherAllocationCount);
                lastPracticalDay[practicalTeacher.subject] = dayIdx;
                return true;
            }
        }
    }
    
    // If we couldn't place in sequence, try any day with enough free time (at least half)
    for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
        // Check if subject already on this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === practicalTeacher.subject)) {
            continue;
        }
        
        // Check if teacher already has class this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.id === practicalTeacher.id)) {
            continue;
        }
        
        // Calculate free time for the day
        const freeTime = dailyClassTime - dayInfo[dayIdx].allocatedMinutes;
        
        // Check if free time is at least half of practical duration
        if (freeTime >= Math.floor(prDur / 2)) {
            // Check if we can actually fit the practical
            if (dayInfo[dayIdx].allocatedMinutes + prDur <= dailyClassTime) {
                placeClassOnDay(dayInfo, dayIdx, practicalTeacher, prDur, subjectAllocationMap, teacherAllocationCount);
                lastPracticalDay[practicalTeacher.subject] = dayIdx;
                return true;
            }
        }
    }
    
    // Last resort: try any day even if it exceeds daily limit
    for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
        // Check if subject already on this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === practicalTeacher.subject)) {
            continue;
        }
        
        // Check if teacher already has class this day
        if (dayInfo[dayIdx].classes.some(c => c.teacher.id === practicalTeacher.id)) {
            continue;
        }
        
        // Place even if exceeds daily limit (practical priority)
        placeClassOnDay(dayInfo, dayIdx, practicalTeacher, prDur, subjectAllocationMap, teacherAllocationCount);
        lastPracticalDay[practicalTeacher.subject] = dayIdx;
        return true;
    }
    
    return false;
}

// ---------- Main scheduling algorithm ----------

function generateWeeklyRoutine() {
    // Read inputs
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    const thDur = parseInt(document.getElementById("theoryDuration").value, 10);
    const prDur = parseInt(document.getElementById("practicalDuration").value, 10);
    const dailyClassTime = parseInt(document.getElementById("dailyClassTime").value, 10);

    // Validation
    if (!start || !end) { alert("Enter college start and end time."); return; }
    if (!thDur || !prDur) { alert("Enter class durations."); return; }
    if (!dailyClassTime || dailyClassTime <= 0) { alert("Enter valid daily class time."); return; }
    if (teachers.length === 0) { alert("Add at least one teacher!"); return; }

    const startMin = parseInt(start.split(":")[0], 10) * 60 + parseInt(start.split(":")[1], 10);
    const endMin = parseInt(end.split(":")[0], 10) * 60 + parseInt(end.split(":")[1], 10);
    
    // Check if college hours can accommodate the daily class time
    if (endMin - startMin < dailyClassTime) { 
        alert(`College time (${endMin-startMin} min) is too small for ${dailyClassTime} minutes of classes.`); 
        return; 
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const dayCount = days.length;

    // Setup day containers
    let dayInfo = [];
    for (let i = 0; i < dayCount; i++) {
        dayInfo.push({
            index: i, 
            name: days[i], 
            allocatedMinutes: 0,
            classes: []
        });
    }

    // Separate teachers by type
    const practicalTeachers = teachers.filter(t => t.classType === "Practical");
    const theoryTeachers = teachers.filter(t => t.classType === "Theory");

    // Track allocations
    let subjectAllocationMap = {};
    let teacherAllocationCount = {};
    let lastPracticalDay = {}; // Track last day a practical was placed for each subject
    
    // Initialize subject allocation map
    teachers.forEach(t => {
        subjectAllocationMap[t.subject] = { 
            target: t.weeklyFrequency, 
            current: 0,
            type: t.classType
        };
        // Initialize last practical day as -1 (no placement yet)
        if (t.classType === "Practical") {
            lastPracticalDay[t.subject] = -1;
        }
    });

    // --------------------- STEP 1: Allocate Practical Classes First (FIXED LOGIC) ---------------------
    // Group practicals by subject
    let practicalSubjects = {};
    for (let pTeacher of practicalTeachers) {
        if (!practicalSubjects[pTeacher.subject]) {
            practicalSubjects[pTeacher.subject] = {
                teachers: [],
                targetFrequency: pTeacher.weeklyFrequency
            };
        }
        practicalSubjects[pTeacher.subject].teachers.push(pTeacher);
    }
    
    // Process each practical subject
    for (let subject in practicalSubjects) {
        const subjectInfo = practicalSubjects[subject];
        const targetFreq = subjectInfo.targetFrequency;
        const teachersForSubject = subjectInfo.teachers;
        
        // Reset last placement day for this subject
        lastPracticalDay[subject] = -1;
        
        // Try to place each required practical class
        for (let classNum = 0; classNum < targetFreq; classNum++) {
            let placed = false;
            
            // Get a teacher for this class (rotate through available teachers)
            const teacherIndex = classNum % teachersForSubject.length;
            const pTeacher = teachersForSubject[teacherIndex];
            
            // Try to allocate using the new logic
            placed = allocatePracticalClass(
                dayInfo, days, pTeacher, prDur, dailyClassTime,
                subjectAllocationMap, teacherAllocationCount, lastPracticalDay
            );
            
            // If not placed, try overflow
            if (!placed) {
                for (let dayIdx = 0; dayIdx < dayCount && !placed; dayIdx++) {
                    // Check if subject already on this day
                    if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === subject)) {
                        continue;
                    }
                    
                    // Check if teacher already has class this day
                    if (dayInfo[dayIdx].classes.some(c => c.teacher.id === pTeacher.id)) {
                        continue;
                    }
                    
                    // Place even if exceeds daily limit
                    placeClassOnDay(dayInfo, dayIdx, pTeacher, prDur, subjectAllocationMap, teacherAllocationCount);
                    lastPracticalDay[subject] = dayIdx;
                    placed = true;
                }
            }
        }
    }

    // --------------------- STEP 2: Allocate Theory Classes with Fixed Pattern ---------------------
    // Sort theory teachers by weekly frequency (higher first)
    const sortedTheoryTeachers = [...theoryTeachers].sort((a, b) => b.weeklyFrequency - a.weeklyFrequency);
    
    for (let theoryTeacher of sortedTheoryTeachers) {
        const targetFreq = theoryTeacher.weeklyFrequency;
        
        // Try to allocate all required classes for this teacher
        for (let classNum = 0; classNum < targetFreq; classNum++) {
            const allocated = allocateTheoryClass(
                dayInfo, days, theoryTeacher, thDur, dailyClassTime, 
                subjectAllocationMap, teacherAllocationCount
            );
            
            if (!allocated) {
                // Try fallback: any available day
                for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
                    if (canPlaceTheoryOnDay(dayInfo, dayIdx, theoryTeacher, thDur, dailyClassTime, subjectAllocationMap)) {
                        placeClassOnDay(dayInfo, dayIdx, theoryTeacher, thDur, subjectAllocationMap, teacherAllocationCount);
                        break;
                    }
                }
            }
        }
    }

    // --------------------- STEP 3: Handle Unplaced Subjects by Replacement ---------------------
    // Check for subjects that haven't met their target frequency
    const unplacedSubjects = [];
    for (const subject in subjectAllocationMap) {
        const allocation = subjectAllocationMap[subject];
        if (allocation.current < allocation.target) {
            unplacedSubjects.push({
                subject: subject,
                needed: allocation.target - allocation.current,
                type: allocation.type,
                teachers: teachers.filter(t => t.subject === subject)
            });
        }
    }
    
    // Sort unplaced subjects by number needed (most needed first)
    unplacedSubjects.sort((a, b) => b.needed - a.needed);
    
    // Try to place unplaced subjects by replacing theory classes
    for (const unplaced of unplacedSubjects) {
        if (unplaced.type === "Practical") continue; // Don't replace practicals
        
        for (let need = 0; need < unplaced.needed; need++) {
            // Find subject with highest number of classes that we can replace
            let subjectClassCounts = {};
            
            // Count classes per subject
            for (let dayIdx = 0; dayIdx < dayCount; dayIdx++) {
                for (let classItem of dayInfo[dayIdx].classes) {
                    const subject = classItem.teacher.subject;
                    if (subject !== unplaced.subject && classItem.teacher.classType === "Theory") {
                        subjectClassCounts[subject] = (subjectClassCounts[subject] || 0) + 1;
                    }
                }
            }
            
            // Find subject with highest count (at least 2 classes)
            let highestSubject = null;
            let highestCount = 0;
            
            for (const subject in subjectClassCounts) {
                if (subjectClassCounts[subject] > highestCount && subjectClassCounts[subject] >= 2) {
                    highestSubject = subject;
                    highestCount = subjectClassCounts[subject];
                }
            }
            
            if (highestSubject) {
                // Find a class of the highest subject to replace
                let replaced = false;
                
                for (let dayIdx = 0; dayIdx < dayCount && !replaced; dayIdx++) {
                    for (let i = 0; i < dayInfo[dayIdx].classes.length && !replaced; i++) {
                        const classItem = dayInfo[dayIdx].classes[i];
                        
                        if (classItem.teacher.subject === highestSubject && classItem.teacher.classType === "Theory") {
                            // Check if unplaced subject already on this day
                            if (dayInfo[dayIdx].classes.some(c => c.teacher.subject === unplaced.subject)) {
                                continue;
                            }
                            
                            // Get a teacher for the unplaced subject
                            const newTeacher = unplaced.teachers[0];
                            if (!newTeacher) continue;
                            
                            // Replace the class
                            dayInfo[dayIdx].classes[i] = {
                                teacher: newTeacher,
                                duration: thDur,
                                type: "Theory"
                            };
                            
                            // Update allocation counts
                            subjectAllocationMap[highestSubject].current--;
                            subjectAllocationMap[unplaced.subject].current++;
                            teacherAllocationCount[newTeacher.id] = (teacherAllocationCount[newTeacher.id] || 0) + 1;
                            
                            // Update the teacher allocation count of the replaced teacher
                            const oldTeacherId = classItem.teacher.id;
                            if (teacherAllocationCount[oldTeacherId] > 0) {
                                teacherAllocationCount[oldTeacherId]--;
                            }
                            
                            replaced = true;
                        }
                    }
                }
            }
        }
    }

    // --------------------- STEP 4: Final Validation and Render ---------------------
    const earliestAllowedSlots = generateAllowedSlots(startMin, endMin - dailyClassTime);
    if (earliestAllowedSlots.length === 0) { 
        alert(`No valid starting slot available within college hours to fit ${dailyClassTime} minutes.`); 
        return; 
    }
    const dayStart = earliestAllowedSlots[0];

    // Calculate statistics
    let statsHtml = "<div class='stats-box'>";
    statsHtml += "<h4>Schedule Statistics</h4>";
    statsHtml += `<p><strong>Daily Class Time:</strong> ${dailyClassTime} minutes</p>`;
    statsHtml += "<p><strong>Subject Coverage:</strong></p><ul>";
    
    let allSubjectsCovered = true;
    let warningMessages = [];
    
    for (let subject in subjectAllocationMap) {
        const progress = subjectAllocationMap[subject];
        const coverage = progress.current >= progress.target ? "✓" : "✗";
        if (progress.current < progress.target) {
            allSubjectsCovered = false;
            warningMessages.push(`${subject}: ${progress.current}/${progress.target} classes`);
        }
        
        statsHtml += `<li>${escapeHtml(subject)}: ${progress.current}/${progress.target} classes ${coverage}</li>`;
    }
    
    statsHtml += `</ul>`;
    
    if (!allSubjectsCovered) {
        statsHtml += `<div class="warning"><strong>Warning:</strong> Some subjects not fully scheduled:<br>${warningMessages.join('<br>')}</div>`;
    } else {
        statsHtml += `<div class="success"><strong>Success:</strong> All subjects are fully scheduled!</div>`;
    }
    
    statsHtml += "</div>";

    // Generate the routine table - REMOVED "Used Time" column
    let html = "<h3>Weekly Routine</h3>";
    html += statsHtml;
    html += "<table><tr><th>Day</th><th>Classes</th></tr>";

    for (let d = 0; d < dayCount; d++) {
        // Sort classes by type (practicals in middle if possible)
        const classEntries = dayInfo[d].classes.slice();
        const theories = classEntries.filter(c => c.type === "Theory");
        const practicals = classEntries.filter(c => c.type === "Practical");

        // Insert practicals in middle of theory list
        let ordered = [];
        if (practicals.length > 0 && theories.length > 0) {
            const mid = Math.floor(theories.length / 2);
            ordered = theories.slice(0, mid).concat(practicals).concat(theories.slice(mid));
        } else if (practicals.length > 0) {
            ordered = practicals;
        } else {
            ordered = theories;
        }

        let blocks = "";
        let currentTime = dayStart;
        
        for (let entry of ordered) {
            const t = entry.teacher;
            const dur = entry.duration;
            const sh = Math.floor(currentTime / 60);
            const sm = currentTime % 60;
            const eh = Math.floor((currentTime + dur) / 60);
            const em = (currentTime + dur) % 60;

            const classTypeClass = t.classType === "Practical" ? "practical-class" : "theory-class";
            
            // REMOVED the line showing duration and class type
            blocks += `
                <div class="class-block ${classTypeClass}">
                    <strong>${escapeHtml(t.subject)} (${escapeHtml(t.code)})</strong><br>
                    <em>${escapeHtml(t.name)}</em><br>
                    <small>${formatTime(sh, sm)} - ${formatTime(eh, em)}</small>
                </div>
            `;
            currentTime += dur;
        }

        // Add free time block if there's remaining time
        const remainingTime = dailyClassTime - dayInfo[d].allocatedMinutes;
        if (remainingTime > 0) {
            blocks += `
                <div class="class-block free-time">
                    <strong>Free Time / Break</strong><br>
                    <small>${remainingTime} minutes</small>
                </div>
            `;
        }

        html += `<tr>
            <td class="day-column">${days[d]}</td>
            <td><div class="class-row">${blocks}</div></td>
        </tr>`;
    }

    html += "</table>";
    
    // Add summary
    const totalClasses = Object.values(subjectAllocationMap).reduce((sum, a) => sum + a.current, 0);
    const totalRequested = Object.values(subjectAllocationMap).reduce((sum, a) => sum + a.target, 0);
    
    html += `<div class="stats-box">
        <h4>Summary</h4>
        <p>Total classes scheduled: ${totalClasses} of ${totalRequested} requested</p>
        <p>Daily class time target: ${dailyClassTime} minutes</p>
        <p>College hours: ${formatTime(Math.floor(startMin/60), startMin%60)} - ${formatTime(Math.floor(endMin/60), endMin%60)}</p>
        <p>Theory classes duration: ${thDur} min | Practical classes: ${prDur} min</p>
    </div>`;
    
    document.getElementById("routine").innerHTML = html;
}
