window.MC_CONTENT = {
  version: "0.1.0",
  brand: "Morning Changes",
  lessons: [
    {id:"rhythm-first", title:"Rhythm First: Quarter Notes That Feel Good", level:"Beginner", category:"Rhythm", duration:15, access:"free", outcome:"Lock one chord to a pulse before adding complexity.", standalone:true},
    {id:"open-chord-flow", title:"Open Chord Changes Without the Panic", level:"Beginner", category:"Chords", duration:15, access:"free", outcome:"Build a clean two-chord loop and stay in time.", standalone:true},
    {id:"root-map", title:"Find Every Root in One Position", level:"Beginner", category:"Fretboard", duration:15, access:"free", outcome:"Locate roots without hunting for them.", standalone:true},
    {id:"pentatonic-home", title:"Make Pentatonic Phrases Sound Like Music", level:"Beginner", category:"Soloing", duration:20, access:"free", outcome:"Use space, repetition, and a target note.", standalone:true},
    {id:"triad-starter", title:"Triads: The Smallest Useful Chord Shapes", level:"Beginner", category:"Harmony", duration:20, access:"premium", outcome:"Turn three-note shapes into rhythm-guitar vocabulary.", standalone:false},
    {id:"barre-survival", title:"Barre Chord Survival Kit", level:"Beginner", category:"Chords", duration:20, access:"premium", outcome:"Make barre chords cleaner with less effort.", standalone:true},
    {id:"shell-voicings", title:"Shell Voicings: Start Here", level:"Intermediate", category:"Jazz Harmony", duration:12, access:"free", outcome:"Play roots, 3rds, and 7ths that imply full harmony.", standalone:true},
    {id:"guide-tones", title:"Guide Tone Resolution Through ii–V–I", level:"Intermediate", category:"Voice Leading", duration:15, access:"free", outcome:"Hear and play the smallest movement between chords.", standalone:true},
    {id:"minor-ii-v", title:"Minor ii–V: am7b5 to D7 to gm", level:"Intermediate", category:"Jazz Harmony", duration:13, access:"free", outcome:"Land a minor cadence with clean harmonic gravity.", standalone:true},
    {id:"arpeggio-positions", title:"Arpeggios in One Neck Position", level:"Intermediate", category:"Soloing", duration:20, access:"premium", outcome:"Follow changes without abandoning one fretboard area.", standalone:false},
    {id:"blues-targets", title:"12-Bar Blues: Target the Chord Change", level:"Intermediate", category:"Blues", duration:20, access:"premium", outcome:"Make a blues solo outline the form.", standalone:true},
    {id:"pentatonic-overlay", title:"Pentatonic Overlay Over a ii–V–I", level:"Intermediate", category:"Soloing", duration:20, access:"premium", outcome:"Use one familiar sound with harmonic intention.", standalone:false},
    {id:"drop-two", title:"Drop 2 Voicings That Connect", level:"Advanced", category:"Comping", duration:25, access:"premium", outcome:"Move chord color across the neck with voice leading.", standalone:false},
    {id:"dominant-color", title:"Dominant Color: b9, #9, and b13", level:"Advanced", category:"Harmony", duration:25, access:"premium", outcome:"Choose altered dominant tension with purpose.", standalone:false},
    {id:"enclosures", title:"Chromatic Enclosures That Resolve", level:"Advanced", category:"Soloing", duration:20, access:"premium", outcome:"Aim chromatic language at the notes that matter.", standalone:true},
    {id:"chord-melody", title:"Chord Melody: Put a Melody on Top", level:"Advanced", category:"Arrangement", duration:30, access:"premium", outcome:"Harmonize a short phrase without losing the melody.", standalone:false},
    {id:"rhythmic-displacement", title:"Rhythmic Displacement Without Losing the Bar", level:"Advanced", category:"Rhythm", duration:20, access:"premium", outcome:"Create surprise while staying inside the groove.", standalone:false}
  ],
  courses: [
    {id:"beginner-foundations", title:"Beginner Foundations", eyebrow:"Foundation · Beginner", access:"free", duration:"8 lessons · 2h 15m", description:"Pulse, clean changes, fretboard orientation, and first musical phrases.", lessonIds:["rhythm-first","open-chord-flow","root-map","pentatonic-home","barre-survival","triad-starter"], accent:"sun"},
    {id:"intermediate-core", title:"Intermediate Guitar", eyebrow:"Foundation · Intermediate", access:"premium", duration:"10 lessons · 3h 40m", description:"Connect harmony, comping, fretboard awareness, and real improvisation.", lessonIds:["shell-voicings","guide-tones","minor-ii-v","arpeggio-positions","pentatonic-overlay","blues-targets"], accent:"ember"},
    {id:"advanced-language", title:"Advanced Language", eyebrow:"Foundation · Advanced", access:"premium", duration:"12 lessons · 5h", description:"Voice leading, color, rhythmic control, and arranging choices.", lessonIds:["drop-two","dominant-color","enclosures","chord-melody","rhythmic-displacement"], accent:"violet"},
    {id:"changes-arpeggios", title:"Play Through the Changes with Arpeggios", eyebrow:"Specialization", access:"premium", duration:"10 lessons · 3h 20m", description:"Build the skill that turns a scale into a real solo through harmony.", lessonIds:["shell-voicings","guide-tones","arpeggio-positions","minor-ii-v","enclosures"], accent:"gold"},
    {id:"blues-lab", title:"Solo Over a 12-Bar Blues", eyebrow:"Specialization", access:"premium", duration:"9 lessons · 2h 45m", description:"A musical path from rhythm and pentatonics to targeting each dominant chord.", lessonIds:["rhythm-first","pentatonic-home","blues-targets","enclosures"], accent:"blue"},
    {id:"theory-101", title:"Theory 101 for Guitar", eyebrow:"Specialization", access:"premium", duration:"14 lessons · 4h", description:"Intervals, scales, chords, keys, and harmonic function—on the fretboard.", lessonIds:["root-map","triad-starter","shell-voicings","guide-tones","minor-ii-v"], accent:"mint"}
  ],
  dailyLessons: [
    {lessonId:"guide-tones", minutes:15, routine:["3 min: Find the 3rd and 7th of cm7 and F7.","5 min: Resolve the closest notes at 60 BPM.","5 min: Apply it to the first four bars of Autumn Leaves.","2 min: Record one clean pass or write what felt sticky."]},
    {lessonId:"pentatonic-home", minutes:15, routine:["3 min: One note, then silence.","5 min: Make one two-bar call and answer it.","5 min: End every phrase on A or C in A minor.","2 min: Keep only the phrase you would sing back."]},
    {lessonId:"shell-voicings", minutes:15, routine:["4 min: Play root–3rd–7th shells slowly.","5 min: Change one chord per bar through cm7–F7–Bbmaj7–Ebmaj7.","4 min: Repeat in a second register.","2 min: Notice which tones barely move."]},
    {lessonId:"rhythm-first", minutes:15, routine:["3 min: Tap quarter notes with the metronome at 70 BPM.","5 min: Strum one chord only on beats 2 and 4.","5 min: Add one anticipatory change before beat 1.","2 min: Play one minute without stopping."]},
    {lessonId:"minor-ii-v", minutes:15, routine:["3 min: Say the chord tones out loud.","5 min: Play am7b5–D7–gm7 at 60 BPM.","5 min: Resolve F# to G and C to Bb on purpose.","2 min: Make a three-note ending on gm7."]}
  ],
  dailyLicks: [
    {title:"A Small Dominant Answer", key:"A blues", duration:"4 min", focus:"Land on C# over A7, then answer with the b7.", pattern:"1 – 3 – 5 – b7", access:"free"},
    {title:"Guide Tone Slide", key:"Bb major", duration:"5 min", focus:"Slide Eb down to D as F7 becomes Bbmaj7.", pattern:"b7 → 3", access:"free"},
    {title:"Minor Cadence Landing", key:"g minor", duration:"4 min", focus:"Let F# rise into G and stop before you overplay it.", pattern:"3 → 1", access:"free"},
    {title:"Pentatonic Breath", key:"e minor", duration:"5 min", focus:"Use one phrase, one rest, then a variation.", pattern:"call → space → answer", access:"free"}
  ],
  dailyExercises: [
    {title:"Tempo Ladder: Clean Eighth Notes", duration:"6 min", tempo:"60 → 68 → 76 → 84 BPM", rule:"Three clean repetitions before moving up."},
    {title:"Chromatic String Crossing", duration:"6 min", tempo:"56 → 72 BPM", rule:"Keep each picked note the same volume."},
    {title:"Triad Change Drill", duration:"7 min", tempo:"60 BPM", rule:"Do not speed up until the chord change feels boring."},
    {title:"Two-String Arpeggio Loop", duration:"6 min", tempo:"65 → 85 BPM", rule:"End every repetition on the root."}
  ],
  standards: [
    {title:"Autumn Leaves", subtitle:"Harmony, shells, arpeggio play-along", href:"after-hours/autumn-leaves/", access:"free", progress:"A-section in progress", tag:"Core standard"},
    {title:"Autumn Leaves · Arpeggios", subtitle:"Chronological bar-by-bar play-along", href:"after-hours/autumn-leaves/arpeggios/", access:"free", progress:"New", tag:"Play-along"},
    {title:"Blue Bossa", subtitle:"Minor key phrasing and ii–V language", href:"#", access:"premium", progress:"Coming next", tag:"Standard lab"},
    {title:"12-Bar Blues Lab", subtitle:"Form, chord targets, turnarounds", href:"#", access:"premium", progress:"Curriculum shell", tag:"Play-along"}
  ],
  plans: {
    free:["Daily 15-minute practice session","Daily lick and exercise","Metronome and tuner","Starter lessons and rotating standard","Local progress and streaks"],
    premium:["Full curriculum and all specialization paths","Full After Hours standards catalog and play-alongs","30-minute guided sessions and review queue","Cross-device sync when accounts ship","Expanded progress insights"]
  }
};
