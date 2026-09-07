export type Entry = {
  id: string;
  kind: string;
  name: string;
  quantity: number;
  data: any;
  version?: number;
};
export const classes = [
  'Physics HL',
  'Chemistry HL',
  'Biology HL',
  'Math AA HL',
  'English',
  'Economics',
];
export const students = [
  'Nithin Selvaraj',
  'Emma Wilson',
  'Liam Chen',
  'Sofia Martinez',
  'Noah Patel',
  'Isabella Brown',
  'Oliver Kim',
  'Mia Thompson',
  'Ethan Davis',
  'Amelia Singh',
  'Lucas Garcia',
  'Charlotte Lee',
  'Mason Anderson',
  'Harper Clark',
  'Logan Robinson',
  'Evelyn Lewis',
  'Alexander Walker',
  'Aria Hall',
  'James Allen',
  'Scarlett Young',
  'Benjamin King',
  'Chloe Wright',
  'Henry Scott',
  'Grace Green',
  'Daniel Adams',
  'Lily Baker',
  'Samuel Nelson',
  'Zoe Carter',
  'Jacob Mitchell',
  'Nora Roberts',
];
const chem = [
  'Sodium chloride',
  'Hydrochloric acid',
  'Copper sulfate',
  'Ethanol',
  'Distilled water',
  'Sodium hydroxide',
  'Beaker · 250 mL',
  'Conical flask · 100 mL',
  'Volumetric flask',
  'Measuring cylinder',
  'Burette · 50 mL',
  'Glass pipette',
  'Test tubes',
  'Bunsen burner',
  'Digital balance',
  'Safety goggles',
  'Lab coats',
  'Nitrile gloves',
  'Universal indicator',
  'Wash bottle',
];
const physics = [
  'Digital multimeter',
  'DC power supply',
  'Connecting leads',
  'Resistor set',
  'Ammeter',
  'Voltmeter',
  'Dynamics trolley',
  'Air track',
  'Pulley set',
  'Slotted masses',
  'Convex lens',
  'Concave mirror',
  'Optical bench',
  'Laser ray box',
  'Thermometer',
  'Calorimeter',
  'Tuning forks',
  'Oscilloscope',
  'Vernier caliper',
  'Micrometer',
];
const bio = [
  'Compound microscope',
  'Microscope slides',
  'Cover slips',
  'Prepared cell slides',
  'Petri dishes',
  'Dissection kit',
  'Forceps',
  'Scalpel',
  'Human skeleton model',
  'Heart model',
  'Leaf specimens',
  'Seed collection',
  'Agar powder',
  'Methylene blue',
  'Iodine solution',
  'Dropper',
  'Incubator',
  'Pipette tips',
  'Safety goggles',
  'Specimen jars',
];
const titles = [
  ['A Brief History of Time', 'Stephen Hawking'],
  ['The Gene', 'Siddhartha Mukherjee'],
  ['To Kill a Mockingbird', 'Harper Lee'],
  ['The Great Gatsby', 'F. Scott Fitzgerald'],
  ['Sapiens', 'Yuval Noah Harari'],
  ['Silent Spring', 'Rachel Carson'],
  ['The Selfish Gene', 'Richard Dawkins'],
  ['Cosmos', 'Carl Sagan'],
  ['1984', 'George Orwell'],
  ['Pride and Prejudice', 'Jane Austen'],
  ['Thinking, Fast and Slow', 'Daniel Kahneman'],
  ['The Alchemist', 'Paulo Coelho'],
  ['The Book Thief', 'Markus Zusak'],
  ['The Kite Runner', 'Khaled Hosseini'],
  ['Educated', 'Tara Westover'],
  ['Fahrenheit 451', 'Ray Bradbury'],
  ['Brave New World', 'Aldous Huxley'],
  ['Animal Farm', 'George Orwell'],
  ['Jane Eyre', 'Charlotte Brontë'],
  ['Frankenstein', 'Mary Shelley'],
  ['The Odyssey', 'Homer'],
  ['Hamlet', 'William Shakespeare'],
  ['Macbeth', 'William Shakespeare'],
  ['Things Fall Apart', 'Chinua Achebe'],
  ['The Namesake', 'Jhumpa Lahiri'],
  ['Life of Pi', 'Yann Martel'],
  ['The Catcher in the Rye', 'J. D. Salinger'],
  ['The Little Prince', 'Antoine de Saint-Exupéry'],
  ['A Short History of Nearly Everything', 'Bill Bryson'],
  ['Surely You’re Joking, Mr. Feynman!', 'Richard Feynman'],
  ['The Double Helix', 'James Watson'],
  ['The Origin of Species', 'Charles Darwin'],
  ['The Immortal Life of Henrietta Lacks', 'Rebecca Skloot'],
  ['Astrophysics for People in a Hurry', 'Neil deGrasse Tyson'],
  ['The Elegant Universe', 'Brian Greene'],
  ['Freakonomics', 'Steven Levitt'],
  ['The Undercover Economist', 'Tim Harford'],
  ['Development as Freedom', 'Amartya Sen'],
  ['Doughnut Economics', 'Kate Raworth'],
  ['The Wealth of Nations', 'Adam Smith'],
  ['How Not to Be Wrong', 'Jordan Ellenberg'],
  ['Fermat’s Enigma', 'Simon Singh'],
  ['The Joy of x', 'Steven Strogatz'],
  ['Flatland', 'Edwin Abbott'],
  ['Mathematics for the IB Diploma', 'Paul Fannon'],
  ['Physics for the IB Diploma', 'K. A. Tsokos'],
  ['Chemistry for the IB Diploma', 'Steve Owen'],
  ['Biology for the IB Diploma', 'Brenda Walpole'],
  ['English Language and Literature', 'Brad Philpot'],
  ['Economics for the IB Diploma', 'Ellie Tragakes'],
];
export function seed(): Entry[] {
  const out: Entry[] = [];
  const add = (kind: string, name: string, data: any, quantity = 0) => {
    const r = {
      id: kind + '-' + (out.filter((x) => x.kind === kind).length + 1),
      kind,
      name,
      data,
      quantity,
    };
    out.push(r);
    return r;
  };
  [chem, physics, bio].forEach((items, l) =>
    items.forEach((name, i) =>
      add(
        'inventory',
        name,
        {
          lab: ['Chemistry', 'Physics', 'Biology'][l],
          category:
            l === 0
              ? i < 6 || i === 18
                ? 'Chemicals'
                : i < 13
                  ? 'Glassware'
                  : i > 14 && i < 18
                    ? 'Safety'
                    : 'General'
              : l === 1
                ? i < 6
                  ? 'Electrical'
                  : i < 10
                    ? 'Mechanics'
                    : i < 14
                      ? 'Optics'
                      : 'Measurement'
                : i < 4
                  ? 'Microscopy'
                  : i < 8
                    ? 'Dissection'
                    : i < 12
                      ? 'Specimens'
                      : 'General',
          unit: l === 0 && i < 6 ? 'mL' : 'pcs',
          minimumQuantity: i % 6 === 0 ? 10 : 3,
          location: `${['C', 'P', 'B'][l]}${(i % 3) + 1} · Cabinet ${Math.floor(i / 5) + 1}`,
          condition: 'Good',
          description: `For supervised ${['chemistry', 'physics', 'biology'][l].toLowerCase()} practical work. Return equipment clean and report any damage after use.`,
          safetyInformation:
            l === 0
              ? 'Wear eye protection and gloves. Follow the laboratory safety protocol.'
              : 'Use under staff supervision.',
          chemicalFormula:
            l === 0 ? ['NaCl', 'HCl', 'CuSO₄', 'C₂H₅OH', 'H₂O', 'NaOH'][i] : '',
          updatedAt: '2026-09-06',
        },
        i % 13 === 0 ? 0 : i % 7 === 0 ? 2 : l === 0 && i < 6 ? 500 : 12 + i,
      ),
    ),
  );
  titles.forEach(([name, author], i) =>
    add(
      'book',
      name,
      {
        author,
        subject:
          i < 10
            ? 'Science'
            : i < 28
              ? 'Literature'
              : i < 35
                ? 'Science'
                : i < 40
                  ? 'Economics'
                  : 'Mathematics',
        isbn: `978000${String(i + 1000).padStart(6, '0')}`,
        publicationYear: 2000 + (i % 24),
        language: 'English',
        publisher: 'School library collection',
        description: `Explore ${name} by ${author}. Available through the Westbridge school library for independent reading and classroom study.`,
        location: `Library · Shelf ${String.fromCharCode(65 + (i % 6))}`,
        total: 3,
      },
      i % 8 === 0 ? 0 : i >= 1 && i <= 8 ? 2 : 3,
    ),
  );
  students.forEach((name, i) =>
    add('student', name, {
      grade: i === 0 ? 'DP-2' : i < 15 ? '11' : '12',
      class: classes[i % 6],
      homeroom: i === 0 ? 'DP2' : i < 15 ? '11A' : '12B',
      studentId: `WB${26001 + i}`,
      attendance: 93 + (i % 8),
      average: 72 + (i % 24),
      status: 'Active',
    }),
  );
  classes.forEach((name, i) =>
    add('class', name, {
      teacher: [
        'Dr. Sarah Mitchell',
        'David Park',
        'Dr. Maya Rao',
        'James Wilson',
        'Emily Thompson',
        'Michael Brooks',
      ][i],
      room: ['P1', 'C1', 'B1', '204', '301', '205'][i],
      time: ['08:30', '09:30', '10:45', '11:45', '13:30', '14:30'][i],
      department: [
        'Science',
        'Science',
        'Science',
        'Mathematics',
        'Languages',
        'Humanities',
      ][i],
    }),
  );
  [
    'Forces and motion investigation',
    'Acid–base titration report',
    'Cell structure worksheet',
    'Differentiation practice',
    'Literary analysis essay',
    'Market structures case study',
    'Waves lab reflection',
    'Reaction kinetics investigation',
    'Genetics problem set',
    'Integration exploration',
    'Individual oral preparation',
    'Inflation research brief',
    'Electric circuits analysis',
    'Organic chemistry revision',
    'Ecology field study',
  ].forEach((name, i) =>
    add('assignment', name, {
      class: classes[i % 6],
      dueAt: `2026-09-${String(8 + i).padStart(2, '0')}T16:00`,
      maximumMarks: i % 3 === 0 ? 30 : 20,
      status: 'Published',
      instructions:
        'Complete the task using the methods discussed in class. Show your reasoning, cite any sources, and submit your written response before the deadline.',
      type: 'text',
    }),
  );
  for (let i = 0; i < 20; i++)
    add('record', i % 3 === 0 ? 'Positive behaviour' : 'Academic concern', {
      studentId: 'student-' + (i + 1),
      studentName: students[i],
      category: i % 3 === 0 ? 'Positive behaviour' : 'Academic concern',
      description:
        i % 3 === 0
          ? 'Demonstrated excellent collaboration during the group investigation.'
          : 'Would benefit from a check-in on the current unit and upcoming coursework.',
      severity: 'Low',
      actionTaken: i % 3 === 0 ? 'Recognised in class' : 'Follow-up arranged',
      studentVisible: true,
      internalNotes: '',
      occurredAt: `2026-09-0${(i % 5) + 1}`,
      status: 'Open',
    });
  for (let i = 0; i < 10; i++)
    add(
      'notification',
      [
        'Welcome to the new academic year',
        'Lab inventory updated',
        'Library reading list available',
        'Upcoming class assignment',
        'Term 1 timetable published',
      ][i % 5],
      {
        description:
          'Open the linked workspace to review the latest information.',
        target: ['Home', 'Labs', 'Library', 'Academics', 'Calendar'][i % 5],
        read: false,
        date: '2026-09-06',
      },
    );
  for (let i = 0; i < 10; i++)
    add('request', out.filter((x) => x.kind === 'inventory')[i].name, {
      itemId: 'inventory-' + (i + 1),
      type: 'lab',
      quantity: (i % 3) + 1,
      purpose: 'Term 1 practical investigation',
      class: classes[i % 3],
      teacher: 'Dr. Sarah Mitchell',
      desiredDate: '2026-09-09',
      status: i < 3 ? 'Pending' : i < 6 ? 'Approved' : 'Completed',
      studentId: 'student-' + (i + 1),
    });
  for (let i = 0; i < 8; i++)
    add('loan', titles[i + 1][0], {
      bookId: 'book-' + (i + 2),
      studentId: 'student-' + (i + 1),
      studentName: students[i],
      borrowedAt: '2026-09-01',
      dueAt: `2026-09-${i < 2 ? '08' : '15'}`,
      status: 'Borrowed',
    });
  [
    'Dr. Sarah Mitchell',
    'David Park',
    'Dr. Maya Rao',
    'James Wilson',
    'Emily Thompson',
    'Michael Brooks',
    'Olivia Reed',
    'Daniel Moore',
    'Priya Nair',
    'Thomas Evans',
    'Ravi Kumar',
    'Helen Shaw',
    'Amir Khan',
    'Alex Carter',
    'Sam Rivera',
  ].forEach((name, i) =>
    add('staff', name, {
      role:
        i < 8
          ? 'Teacher'
          : i < 11
            ? 'Lab Assistant'
            : i < 13
              ? 'Librarian'
              : 'Admin',
      status: 'Active',
    }),
  );
  return out;
}
