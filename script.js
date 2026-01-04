let cachedHarian = [];
let cachedMingguan = [];
let rangeStartDate = null;
let rangeEndDate = null;

// 1. Data Kode Unik (Simulasi)
const userCodes = {
  "Wahyu": "9897",
  "Zaskia": "3231",
  "Nina": "5453",
  "Eki": "6564",
  "Layla": "7675",
  "Fida": "9291",
  "Lorent": "7372",
  "Jihan": "8685"
};

document.getElementById('loginBtn').addEventListener('click', async function() {
  const user = document.getElementById('userSelect').value;
  const code = document.getElementById('loginCode').value;
  const errorElement = document.getElementById('loginError');

  if (!user || !code) {
    errorElement.textContent = "Pilih nama dan isi kode unik!";
    return;
  }

  if (userCodes[user] === code) {
    // Tampilkan Loading
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';


    // 1. Sinkronkan ke userSelect lama agar sistem tahu siapa yang login
    const mainSelect = document.getElementById('userSelect');
    mainSelect.value = user;

    document.getElementById('userDisplay').textContent = `| ${user}`;

    try {
      // 2. Pemicu Otomatis: Jalankan event 'change' yang sudah ada di script.js
      // Ini akan menjalankan fungsi fetch(WEB_APP_URL) yang sudah Anda buat
      mainSelect.dispatchEvent(new Event('change'));

      // 3. Beri jeda sedikit agar fetch selesai, lalu tampilkan konten
      setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // Pastikan tabel dirender ulang jika rentang tanggal sudah ada
        if (rangeStartDate && rangeEndDate) {
           applyDailyData(cachedHarian);
           applyWeeklyGrid(cachedMingguan);
        }
      }, 1500); 

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data.");
      location.reload();
    }
  } else {
    errorElement.textContent = "Kode unik salah!";
  }
});

function formatToLocalISO(date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

const tasks = [
  "Wirit_Doktrin Kejiwaan",
  "Perencanaan Agenda_Target",
  "Iqro, pengamatan_menghayati realitas"
];

const dateHeader = document.getElementById("dateHeader");
const dailyBody = document.getElementById("dailyBody");

function generateDates(start, end) {
  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// new
function getWeeksFromRange(start, end) {
  const weeks = [];
  let current = new Date(start);

  let weekIndex = 1;
  while (current <= end) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      index: weekIndex,
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });

    current.setDate(current.getDate() + 7);
    weekIndex++;
  }

  return weeks;
}


function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function renderTable(dates) {
  dateHeader.innerHTML = `<th class="sticky">Nama Tugas</th>`;
  dailyBody.innerHTML = "";

    dates.forEach(date => {
    const th = document.createElement("th");

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    th.dataset.date = isoDate; // ⬅️ INI PENTING
    th.innerHTML = `
        <div>${date.toLocaleDateString("id-ID", { weekday: "short" })}</div>
        <small>${date.getDate()}</small>
    `;

    if (isToday(date)) {
        th.classList.add("today");
    }

    dateHeader.appendChild(th);
    });

  tasks.forEach(task => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="sticky">${task}</td>`;

    dates.forEach(() => {
      const td = document.createElement("td");
      td.innerHTML = `<input type="checkbox">`;
      tr.appendChild(td);
    });

    dailyBody.appendChild(tr);
  });
}

// new
const weeklyTasks = [
  "Menginap"
];

const weeklyHeader = document.getElementById("weeklyHeader");
const weeklyBody = document.getElementById("weeklyBody");

function renderWeeklyGrid(start, end) {
  const weeks = getWeeksFromRange(start, end);

  weeklyHeader.innerHTML = `<th class="sticky">Nama Tugas</th>`;
  weeklyBody.innerHTML = "";

  weeks.forEach(week => {
    const th = document.createElement("th");
    th.dataset.week = week.index;
    th.innerHTML = `
      <div>Minggu ${week.index}</div>
      <small>
        ${week.start.getDate()}–${week.end.getDate()}
      </small>
    `;
    weeklyHeader.appendChild(th);
  });

  weeklyTasks.forEach(task => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="sticky">${task}</td>`;

    weeks.forEach(() => {
      const td = document.createElement("td");
      td.innerHTML = `<input type="checkbox">`;
      tr.appendChild(td);
    });

    weeklyBody.appendChild(tr);
  });
}


/* Flatpickr Range Picker */
flatpickr("#dateRange", {
  mode: "range",
  dateFormat: "d M Y",
  locale: "id",
  onClose(selectedDates) {
    if (selectedDates.length === 2) {

      // ✅ SIMPAN RANGE
      rangeStartDate = selectedDates[0];
      rangeEndDate   = selectedDates[1];

      console.log("RANGE:", rangeStartDate, rangeEndDate);

      // ✅ RENDER HARIAN
      renderTable(
        generateDates(rangeStartDate, rangeEndDate)
      );

      // ✅ RENDER MINGGUAN (GRID)
      renderWeeklyGrid(rangeStartDate, rangeEndDate);

      // ✅ APPLY DATA JIKA SUDAH ADA
      if (cachedHarian?.length) {
        applyDailyData(cachedHarian);
      }

      if (cachedMingguan?.length) {
        applyWeeklyGrid(cachedMingguan);
      }
    }
  }
});


/* Kalender untuk tanggal selesai tugas mingguan */
flatpickr(".weekly-date", {
  dateFormat: "Y-m-d",
  locale: "id",
  disableMobile: true
});


// UpdateProgres
const userSelect = document.getElementById("userSelect");
const submitBtn = document.getElementById("submitBtn");
const modal = document.getElementById("nameModal");
const closeModal = document.getElementById("closeModal");

submitBtn.addEventListener("click", (e) => {
  if (userSelect.value === "") {
    e.preventDefault();
    modal.style.display = "flex";
    return;
  }

  // nanti di sini logic submit ke Apps Script
  console.log("Submit aman, nama:", userSelect.value);
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  userSelect.focus(); // UX kecil tapi penting
});

// BackEnd
const WEB_APP_URL = "https://wahyuputraramadhan21.vercel.app/api/submit";

    function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
    }


// submitBtn.addEventListener("click", async () => {
//   if (userSelect.value === "") {
//     openModal();
//     return;
//   }

//   const harian = [];
//   const dateHeaders = Array.from(dateHeader.querySelectorAll("th")).slice(1);


//   document.querySelectorAll("#dailyBody tr").forEach((row, rowIndex) => {
//     const taskName = row.querySelector(".sticky").textContent;
//     const checkboxes = row.querySelectorAll("input[type='checkbox']");

//     checkboxes.forEach((cb, i) => {
//       if (cb.checked) {
//         harian.push({
//           tanggal: dateHeaders[i].dataset.date, // ⬅️ yyyy-mm-dd
//           tugas: taskName,
//           status: "Selesai"
//         });
//       }
//     });
//   });

// const mingguan = [];

// document.querySelectorAll(".weekly-table tbody tr").forEach(row => {
//   const tanggalSelesai = row.querySelector(".weekly-date").value;
//   if (!tanggalSelesai) return;

//   const selesaiDate = new Date(tanggalSelesai);
//   const mingguKe = getWeekOfMonth(selesaiDate);

//   mingguan.push({
//     tugas: row.children[0].dataset.task, // aman dari label UI
//     status: row.querySelector(".weekly-status").value,
//     tanggal_selesai: tanggalSelesai,
//     minggu_ke: mingguKe
//   });
// });

// console.log("MINGGUAN PAYLOAD:", mingguan);

//   const payload = {
//     user: userSelect.value,
//     harian,
//     mingguan
//   };

//   await fetch(WEB_APP_URL, {
//     method: "POST",
//     body: JSON.stringify(payload)
//   });

//   alert("✅ Progress berhasil diupdate!");
// });

// new
// submitBtn.addEventListener("click", async (e) => {
//   if (userSelect.value === "") {
//     e.preventDefault();
//     modal.style.display = "flex";
//     return;
//   }

//   /* =====================
//      KUMPULKAN DATA HARIAN
//      ===================== */
//   const harian = [];
//   const dates = Array.from(dateHeader.querySelectorAll("th"))
//     .slice(1)
//     .map(th => th.dataset.date);

//   document.querySelectorAll("#dailyBody tr").forEach(row => {
//     const taskName = row.querySelector(".sticky").textContent;
//     const checkboxes = row.querySelectorAll("input[type='checkbox']");

//     checkboxes.forEach((cb, i) => {
//       if (cb.checked) {
//         harian.push({
//           tanggal: dates[i],
//           tugas: taskName,
//           status: "Selesai"
//         });
//       }
//     });
//   });

//   /* =====================
//      KUMPULKAN DATA MINGGUAN (GRID)
//      ===================== */
//   const mingguan = [];

//   document.querySelectorAll("#weeklyBody tr").forEach(row => {
//     const task = row.querySelector(".sticky").textContent;
//     const checkboxes = row.querySelectorAll("input[type='checkbox']");

//     checkboxes.forEach((cb, i) => {
//       if (cb.checked) {
//         mingguan.push({
//           tugas: task,
//           minggu_ke: i + 1,
//           status: "Selesai"
//         });
//       }
//     });
//   });

//   console.log("PAYLOAD MINGGUAN:", mingguan);

//   /* =====================
//      KIRIM KE BACKEND
//      ===================== */
//   const payload = {
//     user: userSelect.value,
//     harian,
//     mingguan
//   };

//   console.log("FINAL PAYLOAD:", payload);

//   await fetch(WEB_APP_URL, {
//     method: "POST",
//     headers: {
//     "Content-Type": "application/json"
//   },
//     body: JSON.stringify(payload)
//   });

//   alert("✅ Progress berhasil diupdate!");
// });


// NewAgain
submitBtn.addEventListener("click", async (e) => {
  if (userSelect.value === "") {
    e.preventDefault();
    modal.style.display = "flex";
    return;
  }

  // Matikan tombol agar tidak di-klik dua kali (Double-Submit)
  submitBtn.disabled = true;
  submitBtn.innerText = "Memproses...";

  /* =====================
     KUMPULKAN DATA HARIAN (FILTER DUPLIKAT)
     ===================== */
  const harian = [];
  const dates = Array.from(dateHeader.querySelectorAll("th"))
    .slice(1)
    .map(th => th.dataset.date);

  document.querySelectorAll("#dailyBody tr").forEach(row => {
    const taskName = row.querySelector(".sticky").textContent.trim();
    const checkboxes = row.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach((cb, i) => {
      const tgl = dates[i];
      if (cb.checked) {
        // CEK: Apakah data ini sudah ada di cachedHarian (database)?
        const sudahAda = cachedHarian.some(old => 
          old.tanggal === tgl && old.tugas === taskName
        );

        if (!sudahAda) {
          harian.push({
            tanggal: tgl,
            tugas: taskName,
            status: "Selesai"
          });
        }
      }
    });
  });

  /* =====================
     KUMPULKAN DATA MINGGUAN (FILTER DUPLIKAT)
     ===================== */
  const mingguan = [];

  document.querySelectorAll("#weeklyBody tr").forEach(row => {
    const task = row.querySelector(".sticky").textContent.trim();
    const checkboxes = row.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach((cb, i) => {
      const mingguKe = i + 1;
      if (cb.checked) {
        // CEK: Apakah sudah ada di cachedMingguan?
        const sudahAda = cachedMingguan.some(old => 
          old.tugas === task && parseInt(old.minggu_ke) === mingguKe
        );

        if (!sudahAda) {
          mingguan.push({
            tugas: task,
            minggu_ke: mingguKe,
            status: "Selesai"
          });
        }
      }
    });
  });

  // CEK: Jika tidak ada data baru, jangan kirim apa-apa
  if (harian.length === 0 && mingguan.length === 0) {
    alert("Semua data yang dipilih sudah tersimpan sebelumnya.");
    submitBtn.disabled = false;
    submitBtn.innerText = "Update Progress";
    return;
  }

  /* =====================
     KIRIM KE BACKEND
     ===================== */
  const payload = {
    user: userSelect.value,
    harian,
    mingguan
  };

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("✅ Progress berhasil diupdate!");
      // Opsional: Refresh halaman atau ambil data terbaru lagi
      location.reload(); 
    }
  } catch (err) {
    alert("❌ Gagal mengirim data: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Update Progress";
  }
});

// doget
userSelect.addEventListener("change", async () => {
  const user = userSelect.value;
  if (!user) return;

  const res = await fetch(`${WEB_APP_URL}?user=${encodeURIComponent(user)}`);
  const data = await res.json();

  console.log("DATA DARI SERVER:", data);
  console.log("MINGGUAN DARI SERVER:", data.mingguan);


  // ⬇️ SIMPAN, JANGAN APPLY DULU
  cachedHarian = data.harian || [];
  cachedMingguan = data.mingguan || [];

  renderHistory(cachedHarian, cachedMingguan);

  if (typeof applyWeeklyData === "function") {
    applyWeeklyData(cachedMingguan);
  }
});


// tamabahan doget
function renderHistory(harian = [], mingguan = []) {
  const container = document.getElementById("historyContent");

  if (harian.length === 0 && mingguan.length === 0) {
    container.innerHTML = `<p class="muted">Belum ada riwayat.</p>`;
    return;
  }

  container.innerHTML = "";

  // ===== HARIAN =====
  if (harian.length > 0) {
    const hTitle = document.createElement("h4");
    hTitle.textContent = "📅 Progres Harian";
    container.appendChild(hTitle);

    harian
      .slice(-10)
      .reverse()
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
          <b>${item.tugas}</b>
          <span>— ${item.tanggal} (${item.status})</span>
        `;
        container.appendChild(div);
      });
  }

  // ===== MINGGUAN =====
  if (mingguan.length > 0) {
    const mTitle = document.createElement("h4");
    mTitle.textContent = "📆 Progres Mingguan";
    container.appendChild(mTitle);

    mingguan
      .slice(-5)
      .reverse()
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item weekly";
        div.innerHTML = `
          <b>${item.tugas}</b>
          <span>
            — Minggu ke-${item.minggu_ke}
            ${item.tanggal_selesai ? `(${item.tanggal_selesai})` : ""}
            · ${item.status}
          </span>
        `;
        container.appendChild(div);
      });
  }
}


function applyDailyData(harian) {
  console.log("ISI HARIAN:", harian);

  // reset dulu
  document
    .querySelectorAll("#dailyBody input[type='checkbox']")
    .forEach(cb => (cb.checked = false));

  harian.forEach(item => {
    const { tanggal, tugas } = item;

    const th = document.querySelector(
      `#dateHeader th[data-date="${tanggal}"]`
    );

    console.log("MATCH TEST:", tanggal, th?.dataset.date);

    if (!th) return;

    const colIndex =
      Array.from(th.parentNode.children).indexOf(th) - 1;

    const row = Array.from(
      document.querySelectorAll("#dailyBody tr")
    ).find(tr =>
      tr.querySelector(".sticky").textContent.trim() === tugas
    );

    if (!row) return;

    const checkbox = row.querySelectorAll("input[type='checkbox']")[colIndex];
    if (checkbox) checkbox.checked = true;
  });
}


// function mingguan
// function applyWeeklyData(mingguan) {
//   console.log("ISI MINGGUAN:", mingguan);

//   // reset dulu UI
//   document
//     .querySelectorAll(".weekly-table tbody tr")
//     .forEach(row => {
//       row.querySelector(".weekly-status").value = "Belum";
//       row.querySelector(".weekly-date")._flatpickr.clear();

//       // hapus label minggu kalau ada
//       const label = row.querySelector(".week-label");
//       if (label) label.remove();
//     });

//   // kelompokkan data berdasarkan tugas
//   const grouped = {};

//   mingguan.forEach(item => {
//     if (!grouped[item.tugas]) {
//       grouped[item.tugas] = [];
//     }
//     grouped[item.tugas].push(item);
//   });

//   // ambil data TERAKHIR per tugas
//   Object.keys(grouped).forEach(tugas => {
//     const latest = grouped[tugas].sort(
//       (a, b) => b.minggu_ke - a.minggu_ke
//     )[0];

//     const row = Array.from(
//       document.querySelectorAll(".weekly-table tbody tr")
//     ).find(tr =>
//       tr.children[0].dataset.task === tugas
//     );

//     if (!row) return;

//     row.querySelector(".weekly-status").value = latest.status;

//     if (latest.tanggal_selesai) {
//       row
//         .querySelector(".weekly-date")
//         ._flatpickr.setDate(latest.tanggal_selesai, true);
//     }

//     // 👉 TAMBAH LABEL MINGGU
//     const label = document.createElement("small");
//     label.className = "week-label";
//     label.style.display = "block";
//     label.style.color = "#888";
//     label.textContent = `Minggu ke-${latest.minggu_ke}`;

//     row.children[0].appendChild(label);
//   });
// }



// new
function applyWeeklyGrid(mingguan) {
  document
    .querySelectorAll("#weeklyBody input[type='checkbox']")
    .forEach(cb => (cb.checked = false));

  mingguan.forEach(item => {
    const { tugas, minggu_ke } = item;

    const row = Array.from(
      document.querySelectorAll("#weeklyBody tr")
    ).find(tr =>
      tr.querySelector(".sticky").textContent.trim() === tugas
    );

    if (!row) return;

    const checkbox = row.querySelectorAll(
      'input[type="checkbox"]'
    )[minggu_ke - 1];

    if (checkbox) checkbox.checked = true;
  });
}







