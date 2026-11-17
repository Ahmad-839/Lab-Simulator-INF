export interface LessonTopic {
  id: string;
  number: number;
  title: string;
  category: 'Dasar Jaringan' | 'Perangkat & Kabel' | 'Pengalamatan IP' | 'Nirkabel & Keamanan';
  summary: string;
  explanation: string[];
  example: string;
  visualType:
    | 'network_concept'
    | 'lan_vs_wlan'
    | 'wired_vs_wireless'
    | 'devices'
    | 'topology'
    | 'utp_colors'
    | 'ip_addressing'
    | 'access_point'
    | 'wifi_security';
  checkQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    feedback: string;
  };
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LEARNING_TOPICS: LessonTopic[] = [
  {
    id: 'pengertian-jaringan',
    number: 1,
    title: 'Pengertian Jaringan Komputer',
    category: 'Dasar Jaringan',
    summary: 'Bagaimana dua atau lebih perangkat saling terhubung untuk berbagi data dan sumber daya.',
    explanation: [
      'Jaringan komputer adalah sistem yang menghubungkan dua atau lebih perangkat komputasi (PC, laptop, server, printer, smartphone) melalui media transmisi kabel maupun nirkabel.',
      'Tujuan utamanya meliputi berbagi file (file sharing), berbagi perangkat keras seperti printer jaringan, komunikasi data secara cepat, serta akses internet bersama.',
      'Setiap komunikasi membutuhkan Pengirim (Sender), Media Transmisi (Kabel UTP / Gelombang Radio), Protokol (TCP/IP), dan Penerima (Receiver).',
    ],
    example: 'Contoh nyata di sekolah: 30 komputer di lab SMK terhubung ke 1 Printer Jaringan dan 1 Server materi sehingga siswa tidak perlu memindahkan file memakai flashdisk.',
    visualType: 'network_concept',
    checkQuestion: {
      question: 'Apa manfaat utama menghubungkan komputer-komputer di ruang lab ke dalam satu jaringan?',
      options: [
        'Membuat layar monitor menjadi lebih terang',
        'Memungkinkan pertukaran data dan pemakaian printer/internet secara bersama',
        'Menghilangkan kebutuhan sistem operasi pada komputer',
        'Memperbesar kapasitas harddisk fisik setiap PC',
      ],
      correctIndex: 1,
      feedback: 'Benar! Jaringan memungkinkan pertukaran data cepat serta berbagi sumber daya seperti printer dan koneksi internet.',
    },
  },
  {
    id: 'lan-dan-wlan',
    number: 2,
    title: 'Pengertian LAN dan WLAN',
    category: 'Dasar Jaringan',
    summary: 'Mengenal cakupan jaringan lokal berkabel (LAN) dan jaringan lokal nirkabel (WLAN).',
    explanation: [
      'LAN (Local Area Network) adalah jaringan komputer dalam area geografis terbatas seperti satu ruang kelas, laboratorium komputer, rumah, atau satu gedung sekolah.',
      'WLAN (Wireless Local Area Network) merupakan jaringan LAN yang memanfaatkan gelombang radio (standar IEEE 802.11 / WiFi) alih-alih kabel sebagai media penghubungnya.',
      'Keduanya sering digabungkan: komputer desktop memakai LAN kabel demi stabilitas kecepatan tinggi, sementara laptop dan smartphone siswa memakai WLAN.',
    ],
    example: 'Lab TKJ menggunakan kabel UTP (LAN) untuk 20 PC praktik dan Access Point (WLAN) agar guru dapat terhubung memakai laptop secara fleksibel.',
    visualType: 'lan_vs_wlan',
    checkQuestion: {
      question: 'Perangkat utama yang digunakan untuk memancarkan jaringan WLAN agar laptop dan smartphone dapat terhubung adalah...',
      options: ['Modem Dial-up', 'Access Point', 'Kabel Coaxial', 'Konektor RJ11'],
      correctIndex: 1,
      feedback: 'Tepat! Access Point mengubah sinyal jaringan kabel LAN menjadi gelombang radio WiFi (WLAN).',
    },
  },
  {
    id: 'kabel-vs-nirkabel',
    number: 3,
    title: 'Perbedaan Jaringan Kabel dan Nirkabel',
    category: 'Dasar Jaringan',
    summary: 'Membandingkan keunggulan, latensi, keamanan, dan mobilitas media kabel vs WiFi.',
    explanation: [
      'Jaringan Kabel (UTP/Fiber) menawarkan kecepatan stabil, latensi rendah, dan tahan terhadap gangguan sinyal elektromagnetik atau tembok beton.',
      'Jaringan Nirkabel (WiFi) unggul dalam mobilitas tinggi dan kerapian instalasi tanpa kabel menjuntai, namun kekuatannya dipengaruhi jarak dan hambatan fisik.',
      'Pada simulasi di aplikasi ini, kalian bisa melihat bahwa perangkat WiFi di luar radius Access Point akan otomatis terputus (Disconnected).',
    ],
    example: 'Server ujian sekolah wajib memakai kabel UTP/LAN karena membutuhkan koneksi stabil tanpa putus, sedangkan tamu sekolah cukup memakai WiFi.',
    visualType: 'wired_vs_wireless',
    checkQuestion: {
      question: 'Mengapa Server sekolah lebih disarankan terhubung menggunakan kabel UTP dibandingkan WiFi?',
      options: [
        'Karena kabel UTP lebih murah daripada tidak memakai kabel',
        'Karena koneksi kabel lebih stabil, berlatensi rendah, dan tidak terpengaruh jarak sinyal',
        'Karena Server tidak bisa memiliki IP Address jika memakai WiFi',
        'Karena WiFi hanya bisa dipakai pada malam hari',
      ],
      correctIndex: 1,
      feedback: 'Benar! Koneksi kabel jauh lebih stabil, aman dari interferensi radio, dan memiliki latensi lebih rendah.',
    },
  },
  {
    id: 'fungsi-perangkat',
    number: 4,
    title: 'Fungsi Perangkat Jaringan',
    category: 'Perangkat & Kabel',
    summary: 'Peran spesifik Switch, Router, Access Point, Modem, Server, dan End Device.',
    explanation: [
      'Switch menghubungkan banyak perangkat dalam satu jaringan lokal (LAN) berdasarkan alamat MAC. Switch tidak membagi jaringan menjadi beberapa subnet berbeda.',
      'Router bekerja di Layer 3 (IP) untuk menghubungkan dua jaringan yang berbeda (misalnya LAN sekolah ke jaringan ISP/internet) sekaligus berfungsi sebagai Default Gateway.',
      'Modem menghubungkan jalur ISP ke Router, sedangkan Access Point menyediakan akses WiFi bagi perangkat bergerak.',
    ],
    example: 'Alur internet sekolah: Kabel Fiber ISP → Modem → Router (Gateway 192.168.1.1) → Switch → PC Lab & Access Point → Laptop/HP.',
    visualType: 'devices',
    checkQuestion: {
      question: 'Perangkat mana yang bertugas menghubungkan dua jaringan dengan segmen IP berbeda dan menjadi Default Gateway?',
      options: ['Switch', 'Router', 'Konektor RJ45', 'Printer Jaringan'],
      correctIndex: 1,
      feedback: 'Betul! Router berfungsi merutekan paket antarjaringan yang berbeda segmen IP.',
    },
  },
  {
    id: 'topologi-star-bus',
    number: 5,
    title: 'Topologi Star dan Topologi Bus',
    category: 'Perangkat & Kabel',
    summary: 'Memahami arsitektur fisik jaringan kabel serta ketahanannya terhadap gangguan.',
    explanation: [
      'Topologi Star menghubungkan setiap komputer ke satu perangkat pusat (Switch). Jika satu kabel PC putus, komputer lain tetap berjalan normal.',
      'Topologi Bus menggunakan satu kabel utama (backbone) yang dilalui semua komputer secara bersama-sama. Jika kabel utama terputus, seluruh jaringan lumpuh.',
      'Hampir seluruh laboratorium SMK modern menggunakan topologi Star karena mudah dirawat dan didiagnosis.',
    ],
    example: 'Di Simulator LAN, ketika kamu menghubungkan 4 PC ke 1 Switch, bentuk jaringan yang terbentuk adalah Topologi Star.',
    visualType: 'topology',
    checkQuestion: {
      question: 'Apa kelemahan terbesar Topologi Bus dibandingkan Topologi Star?',
      options: [
        'Memerlukan terlalu banyak perangkat Switch',
        'Jika kabel utama (backbone) putus, seluruh jaringan berhenti bekerja',
        'Tidak mendukung penggunaan IP Address',
        'Hanya bisa digunakan oleh laptop',
      ],
      correctIndex: 1,
      feedback: 'Tepat! Topologi Bus bergantung pada satu jalur utama sehingga gangguan pada backbone melumpuhkan semua host.',
    },
  },
  {
    id: 'kabel-utp-t568',
    number: 6,
    title: 'Kabel UTP & Susunan Warna T568A / T568B',
    category: 'Perangkat & Kabel',
    summary: 'Standar urutan 8 warna kabel tembaga pada konektor RJ45 untuk Straight dan Crossover.',
    explanation: [
      'Kabel UTP berisi 4 pasang (8 helai) kabel berwarna: Oranye, Hijau, Biru, dan Cokelat beserta pasangan putih-stripnya.',
      'Kabel Straight-Through menggunakan standar yang sama di kedua ujung (umumnya T568B – T568B) untuk menghubungkan perangkat berbeda jenis (PC ↔ Switch, Switch ↔ Router).',
      'Kabel Crossover menyilangkan pin Transmit dan Receive (T568A – T568B) untuk menghubungkan perangkat sejenis secara langsung (PC ↔ PC, Switch ↔ Switch).',
    ],
    example: 'Urutan T568B (Pin 1–8): Putih Oranye, Oranye, Putih Hijau, Biru, Putih Biru, Hijau, Putih Cokelat, Cokelat.',
    visualType: 'utp_colors',
    checkQuestion: {
      question: 'Jika ingin menghubungkan dua komputer (PC 1 dan PC 2) secara langsung tanpa Switch, jenis kabel apa yang dibutuhkan?',
      options: ['Kabel Straight (T568B – T568B)', 'Kabel Crossover (T568A – T568B)', 'Kabel HDMI', 'Kabel Power AC'],
      correctIndex: 1,
      feedback: 'Benar! Koneksi langsung antarperangkat sejenis (PC ke PC) memerlukan kabel Crossover.',
    },
  },
  {
    id: 'ip-subnet-gateway-dns',
    number: 7,
    title: 'IP Address, Subnet Mask, Gateway & DNS',
    category: 'Pengalamatan IP',
    summary: 'Memahami identitas logis setiap perangkat agar paket data sampai ke tujuan yang tepat.',
    explanation: [
      'IP Address (contoh: 192.168.1.2) adalah alamat unik setiap perangkat di jaringan. Dua perangkat dalam satu LAN tidak boleh memiliki IP yang sama (IP Conflict).',
      'Subnet Mask (contoh: 255.255.255.0) menentukan bagian Network ID dan Host ID. Perangkat dengan Network ID yang sama bisa saling berkomunikasi langsung.',
      'Default Gateway (contoh: 192.168.1.1) adalah alamat IP Router sebagai pintu keluar saat mengirim data ke jaringan lain. DNS menerjemahkan nama domain (smk.sch.id) menjadi IP Address.',
    ],
    example: 'PC 1 (192.168.1.2/24) bisa langsung ping PC 2 (192.168.1.3/24) karena Network ID sama-sama 192.168.1.0.',
    visualType: 'ip_addressing',
    checkQuestion: {
      question: 'Apa yang terjadi jika dua komputer dalam satu jaringan LAN diberi IP Address yang persis sama (misal sama-sama 192.168.1.5)?',
      options: [
        'Kecepatan transfer menjadi dua kali lebih cepat',
        'Terjadi IP Conflict sehingga komunikasi data gagal atau terganggu',
        'Switch otomatis mengganti kabel menjadi Crossover',
        'Komputer berubah menjadi Access Point',
      ],
      correctIndex: 1,
      feedback: 'Tepat! IP Address harus unik per perangkat; IP yang kembar memicu konflik IP.',
    },
  },
  {
    id: 'cara-kerja-ap',
    number: 8,
    title: 'Cara Kerja Access Point & DHCP',
    category: 'Nirkabel & Keamanan',
    summary: 'Bagaimana SSID dipancarkan dan klien menerima alamat IP secara otomatis.',
    explanation: [
      'Access Point memancarkan nama jaringan yang disebut SSID (Service Set Identifier) agar dapat ditemukan oleh Laptop atau Smartphone.',
      'Saat fitur DHCP Server aktif, Access Point atau Router secara otomatis meminjamkan IP Address dari rentang Pool (misal 192.168.1.100 – 192.168.1.150) kepada perangkat yang baru terhubung.',
      'Kekuatan sinyal WiFi melemah seiring bertambahnya jarak atau adanya gangguan (interferensi) dari dinding dan perangkat elektronik lain.',
    ],
    example: 'Siswa memilih SSID "Lab_TJKT_SMK", memasukkan password, lalu HP langsung mendapatkan IP 192.168.1.100 dari DHCP.',
    visualType: 'access_point',
    checkQuestion: {
      question: 'Layanan apa yang memungkinkan smartphone mendapatkan IP Address secara otomatis saat terhubung ke WiFi?',
      options: ['DNS', 'DHCP', 'RJ45', 'Crossover'],
      correctIndex: 1,
      feedback: 'Benar! DHCP (Dynamic Host Configuration Protocol) membagikan IP, Subnet Mask, dan Gateway secara otomatis.',
    },
  },
  {
    id: 'keamanan-wifi',
    number: 9,
    title: 'Keamanan Jaringan WiFi (WPA2 / WPA3)',
    category: 'Nirkabel & Keamanan',
    summary: 'Melindungi jaringan nirkabel sekolah dari penyusup dan penyadapan data.',
    explanation: [
      'Jaringan WiFi berstatus Open (tanpa password) sangat berbahaya karena siapa saja di sekitar area sinyal dapat terhubung dan menyadap lalu lintas data.',
      'WPA2-PSK (AES) adalah standar keamanan WiFi yang umum digunakan di sekolah dan kantor dengan password minimal 8 karakter.',
      'WPA3 adalah standar terbaru yang memberikan enkripsi lebih kuat dan perlindungan terhadap serangan tebak password (brute-force).',
    ],
    example: 'Atur SSID Lab Sekolah dengan enkripsi WPA2 atau WPA3 serta kombinasi password yang kuat minimal 8 karakter.',
    visualType: 'wifi_security',
    checkQuestion: {
      question: 'Manakah konfigurasi keamanan WiFi yang paling direkomendasikan untuk jaringan laboratorium sekolah?',
      options: [
        'Open Network tanpa password agar semua orang bisa masuk',
        'WPA2 atau WPA3 dengan password minimal 8 karakter yang kuat',
        'Menghapus SSID dan mematikan Access Point',
        'Menggunakan IP Broadcast 192.168.1.255',
      ],
      correctIndex: 1,
      feedback: 'Tepat! WPA2 dan WPA3 mengenkripsi lalu lintas data nirkabel dan mencegah akses tidak sah.',
    },
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topicId: 'lan-dan-wlan',
    topicTitle: 'Pengertian LAN dan WLAN',
    question: 'Jaringan komputer yang mencakup area terbatas seperti satu ruangan laboratorium komputer SMK disebut...',
    options: ['WAN (Wide Area Network)', 'LAN (Local Area Network)', 'MAN (Metropolitan Area Network)', 'PAN (Personal Area Network)'],
    correctIndex: 1,
    explanation: 'LAN (Local Area Network) adalah jaringan berskala lokal dalam satu ruangan, gedung, atau area kampus/sekolah.',
  },
  {
    id: 'q2',
    topicId: 'kabel-utp-t568',
    topicTitle: 'Kabel UTP & Susunan Warna T568A/T568B',
    question: 'Untuk menghubungkan PC ke Switch pada jaringan LAN topologi Star, jenis kabel UTP yang tepat adalah...',
    options: ['Kabel Crossover', 'Kabel Straight-Through', 'Kabel Rollover', 'Kabel Fiber Optik Single-Mode'],
    correctIndex: 1,
    explanation: 'Kabel Straight-Through digunakan untuk menghubungkan perangkat yang berbeda jenis/layer, seperti PC ke Switch atau Switch ke Router.',
  },
  {
    id: 'q3',
    topicId: 'kabel-utp-t568',
    topicTitle: 'Kabel UTP & Susunan Warna T568A/T568B',
    question: 'Apa urutan warna Pin 1, 2, dan 3 pada standar kabel T568B?',
    options: [
      'Putih Hijau, Hijau, Putih Oranye',
      'Putih Oranye, Oranye, Putih Hijau',
      'Biru, Putih Biru, Hijau',
      'Putih Cokelat, Cokelat, Putih Biru',
    ],
    correctIndex: 1,
    explanation: 'Standar T568B dimulai dari Pin 1: Putih Oranye, Pin 2: Oranye, Pin 3: Putih Hijau, Pin 4: Biru, Pin 5: Putih Biru, Pin 6: Hijau, Pin 7: Putih Cokelat, Pin 8: Cokelat.',
  },
  {
    id: 'q4',
    topicId: 'fungsi-perangkat',
    topicTitle: 'Fungsi Perangkat Jaringan',
    question: 'Perangkat jaringan yang bertugas menghubungkan beberapa jaringan dengan segmen IP berbeda dan menentukan rute paket adalah...',
    options: ['Switch', 'Hub', 'Router', 'Konektor RJ45'],
    correctIndex: 2,
    explanation: 'Router beroperasi pada Layer 3 (Network) untuk merutekan data antar jaringan dengan subnet IP yang berbeda.',
  },
  {
    id: 'q5',
    topicId: 'ip-subnet-gateway-dns',
    topicTitle: 'IP Address, Subnet Mask, Gateway & DNS',
    question: 'Jika PC 1 memiliki IP 192.168.1.2 dan Subnet Mask 255.255.255.0, manakah IP Address untuk PC 2 agar berada pada subnet yang sama?',
    options: ['192.168.2.3', '192.168.1.10', '10.0.0.2', '192.168.1.255'],
    correctIndex: 1,
    explanation: 'Dengan Subnet Mask 255.255.255.0, tiga oktet pertama harus sama (192.168.1.x), dan .255 tidak boleh dipakai karena merupakan alamat Broadcast.',
  },
  {
    id: 'q6',
    topicId: 'ip-subnet-gateway-dns',
    topicTitle: 'IP Address, Subnet Mask, Gateway & DNS',
    question: 'Pada konfigurasi TCP/IP komputer, kolom Default Gateway umumnya diisi dengan alamat IP dari...',
    options: ['Printer Jaringan', 'Switch Layer 2', 'Port LAN Router yang terhubung ke jaringan tersebut', 'Komputer tetangga terdekat'],
    correctIndex: 2,
    explanation: 'Default Gateway adalah alamat IP antarmuka Router lokal yang menjadi pintu keluar menuju jaringan lain.',
  },
  {
    id: 'q7',
    topicId: 'ip-subnet-gateway-dns',
    topicTitle: 'IP Address, Subnet Mask, Gateway & DNS',
    question: 'Fungsi utama DNS Server dalam jaringan komputer adalah...',
    options: [
      'Membagikan kabel UTP secara otomatis',
      'Menerjemahkan nama domain (seperti kemdikbud.go.id) menjadi alamat IP',
      'Mengubah sinyal WiFi menjadi kabel listrik',
      'Memblokir semua paket Ping di LAN',
    ],
    correctIndex: 1,
    explanation: 'DNS (Domain Name System) memetakan nama domain yang mudah diingat manusia ke alamat IP numerik.',
  },
  {
    id: 'q8',
    topicId: 'topologi-star-bus',
    topicTitle: 'Topologi Star dan Topologi Bus',
    question: 'Kelebihan utama Topologi Star yang menggunakan Switch dibandingkan Topologi Bus adalah...',
    options: [
      'Tidak membutuhkan sumber listrik',
      'Jika salah satu kabel komputer putus, komputer lain tetap terhubung normal',
      'Tidak memerlukan konektor RJ45',
      'Hanya menggunakan satu kabel lurus untuk semua komputer',
    ],
    correctIndex: 1,
    explanation: 'Pada Topologi Star, setiap host memiliki jalur kabel sendiri ke Switch sehingga kerusakan satu kabel tidak memutus koneksi perangkat lain.',
  },
  {
    id: 'q9',
    topicId: 'cara-kerja-ap',
    topicTitle: 'Cara Kerja Access Point & DHCP',
    question: 'Apa kepanjangan dan fungsi dari SSID pada perangkat Access Point?',
    options: [
      'Secure System ID; untuk menghitung panjang kabel UTP',
      'Service Set Identifier; nama jaringan WiFi yang dipancarkan agar dikenali perangkat klien',
      'Static Subnet ID; alamat MAC bawaan Switch',
      'Serial Signal Data; port kabel menuju Modem',
    ],
    correctIndex: 1,
    explanation: 'SSID adalah identitas nama jaringan nirkabel (WiFi) yang tampil saat laptop atau smartphone memindai jaringan.',
  },
  {
    id: 'q10',
    topicId: 'keamanan-wifi',
    topicTitle: 'Keamanan Jaringan WiFi (WPA2 / WPA3)',
    question: 'Standar keamanan WiFi modern yang menawarkan enkripsi terkuat terhadap serangan brute-force adalah...',
    options: ['Open / Tanpa Password', 'WEP 64-bit', 'WPA3', 'MAC Filtering saja tanpa enkripsi'],
    correctIndex: 2,
    explanation: 'WPA3 adalah standar keamanan WiFi terbaru yang menggantikan WPA2 dengan perlindungan enkripsi jauh lebih kuat.',
  },
  {
    id: 'q11',
    topicId: 'kabel-vs-nirkabel',
    topicTitle: 'Perbedaan Jaringan Kabel dan Nirkabel',
    question: 'Seorang siswa membawa laptop menjauh keluar gedung hingga melewati radius jangkauan Access Point. Status koneksi yang terjadi adalah...',
    options: [
      'Tetap Connected dengan kecepatan maksimal',
      'Berubah menjadi Disconnected karena sinyal di luar jangkauan',
      'Otomatis berpindah memakai kabel Crossover',
      'IP Address berubah menjadi 255.255.255.0',
    ],
    correctIndex: 1,
    explanation: 'Gelombang radio WiFi memiliki batas jarak pancar; di luar radius efektif, kekuatan sinyal turun drastis hingga terputus (Disconnected).',
  },
  {
    id: 'q12',
    topicId: 'pengertian-jaringan',
    topicTitle: 'Pengertian Jaringan Komputer',
    question: 'Perintah jaringan yang digunakan pada terminal untuk menguji apakah dua perangkat dapat saling berkomunikasi dan mengukur waktu tempuh paket (latency) adalah...',
    options: ['format', 'ping', 'mkdir', 'crimping'],
    correctIndex: 1,
    explanation: 'Perintah ping mengirimkan paket ICMP Echo Request ke IP tujuan dan menunggu balasan Echo Reply.',
  },
];
