const SUPABASE_URL =
  "https://zfhulkqlnwxcpfelhvmh.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_5lhSzbkgtVHA03DQbTP6yw_CodtM65a";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ===============================
// KONFIGURASI
// ===============================

const CATEGORIES = [
  "Grape",
  "Strawberry",
  "Banana",
  "Mix Fruit"
];

const DEFAULT_SETTINGS = {
  name: "Sweety Berry",
  description:
    "Perpaduan strawberry segar dan cokelat yang dibuat dengan penuh rasa.",
  whatsapp: "6287845809969",
  instagram: "@sweety.berry",
  hours: "Setiap hari, 10.00–21.00",
  maps_url:
    "https://maps.app.goo.gl/PmF1YXZGbTHDiSKGA",
  tagline: "Fresh • Sweet • Homemade",
  address: "Sweet Berry Babarsari"
};

const DEFAULT_PRODUCTS = [
  {
    name: "Strawberry Chocolate",
    description:
      "Strawberry segar dengan balutan cokelat yang manis.",
    price_small: 15000,
    price_regular: 20000,
    price_small_dubai: null,
    price_regular_dubai: null,
    category: "Strawberry",
    image: "",
    available: true
  },

  {
    name: "Strawberry Milk",
    description:
      "Minuman strawberry creamy yang segar dan lembut.",
    price_small: 12000,
    price_regular: 17000,
    price_small_dubai: null,
    price_regular_dubai: null,
    category: "Strawberry",
    image: "",
    available: true
  },

  {
    name: "Chocolate Strawberry Cup",
    description:
      "Potongan strawberry dan cokelat dalam satu cup.",
    price_small: 18000,
    price_regular: 25000,
    price_small_dubai: null,
    price_regular_dubai: null,
    category: "Strawberry",
    image: "",
    available: true
  }
];


// ===============================
// STATE
// ===============================

let list = [];

let settings = {
  ...DEFAULT_SETTINGS
};

let settingsId = null;

let editId = null;

let image = "";


// ===============================
// ELEMENT
// ===============================

const login =
  document.getElementById("login");

const app =
  document.getElementById("app");

const loginForm =
  document.getElementById("loginForm");

const productForm =
  document.getElementById("productForm");

const settingsForm =
  document.getElementById("settingsForm");


// ===============================
// HELPER
// ===============================

function rp(number) {

  if (
    number === null ||
    number === undefined ||
    number === "" ||
    Number(number) <= 0
  ) {
    return "";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(number));
}


function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


function normalizeCategory(category) {

  if (category === "Anggur") {
    return "Grape";
  }

  if (category === "Pisang") {
    return "Banana";
  }

  if (category === "Minuman") {
    return "Mix Fruit";
  }

  if (category === "Dessert") {
    return "Mix Fruit";
  }

  if (CATEGORIES.includes(category)) {
    return category;
  }

  return "Mix Fruit";
}


function normalizePrice(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return number > 0
    ? number
    : null;
}


function formatWhatsAppNumber(number) {

  let phone =
    String(number || "")
      .replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone =
      "62" +
      phone.substring(1);
  }

  return phone;
}


function getPriceInput(id) {

  const value =
    document
      .getElementById(id)
      .value
      .trim();

  if (value === "") {
    return null;
  }

  return Number(value);
}


// ===============================
// AUTH
// ===============================

async function checkSession() {

  const {
    data,
    error
  } = await db.auth.getSession();

  if (error) {
    console.error(error);
    return;
  }

  if (data.session) {
    await show();
  }
}


loginForm.onsubmit =
  async function (event) {

    event.preventDefault();

    const email =
      document
        .getElementById("user")
        .value
        .trim();

    const password =
      document
        .getElementById("pass")
        .value;

    const err =
      document.getElementById("err");

    err.textContent = "";

    if (!email || !password) {

      err.textContent =
        "Email dan password wajib diisi.";

      return;
    }

    const {
      error
    } =
      await db.auth.signInWithPassword({
        email,
        password
      });

    if (error) {

      console.error(error);

      err.textContent =
        "Email atau password salah.";

      return;
    }

    await show();
  };


// ===============================
// SHOW ADMIN
// ===============================

async function show() {

  login.classList.add("hidden");

  app.classList.remove("hidden");

  await loadProducts();

  await loadSettings();

  render();

  fillSettings();
}


// ===============================
// LOGOUT
// ===============================

document.getElementById(
  "logout"
).onclick = async function () {

  const {
    error
  } = await db.auth.signOut();

  if (error) {
    console.error(error);
    return;
  }

  location.reload();
};


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

  const {
    data,
    error
  } = await db
    .from("products")
    .select("*")
    .order(
      "created_at",
      {
        ascending: true
      }
    );

  if (error) {

    console.error(error);

    alert(
      "Gagal mengambil data produk dari Supabase."
    );

    list = [];

    return;
  }

  list = data || [];

  // Jika tabel masih kosong,
  // masukkan produk awal.
  if (list.length === 0) {

    const {
      data: inserted,
      error: insertError
    } = await db
      .from("products")
      .insert(DEFAULT_PRODUCTS)
      .select();

    if (insertError) {

      console.error(insertError);

      return;
    }

    list = inserted || [];
  }
}


// ===============================
// LOAD SETTINGS
// ===============================

async function loadSettings() {

  const {
    data,
    error
  } = await db
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {

    console.error(error);

    settings = {
      ...DEFAULT_SETTINGS
    };

    return;
  }

  if (!data) {

    const {
      data: inserted,
      error: insertError
    } = await db
      .from("store_settings")
      .insert(DEFAULT_SETTINGS)
      .select()
      .single();

    if (insertError) {

      console.error(insertError);

      settings = {
        ...DEFAULT_SETTINGS
      };

      return;
    }

    settings = inserted;

    settingsId = inserted.id;

    return;
  }

  settings = {
    ...DEFAULT_SETTINGS,
    ...data
  };

  settingsId = data.id;
}


// ===============================
// TAB
// ===============================

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.onclick =
      function () {

        document
          .querySelectorAll(".tab")
          .forEach(tab => {

            tab.classList.remove(
              "active"
            );

          });

        button.classList.add(
          "active"
        );

        document
          .getElementById("productTab")
          .classList.toggle(
            "hidden",
            button.dataset.tab !==
              "productTab"
          );

        document
          .getElementById("settingTab")
          .classList.toggle(
            "hidden",
            button.dataset.tab !==
              "settingTab"
          );
      };
  });


// ===============================
// IMAGE PREVIEW
// ===============================

document.getElementById(
  "image"
).onchange =
  function (event) {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      alert(
        "Gambar maksimal 2 MB."
      );

      event.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      function () {

        image =
          reader.result;

        const preview =
          document.getElementById(
            "preview"
          );

        preview.innerHTML =
          `<img
            src="${image}"
            alt="Preview produk"
          >`;

        preview.classList.remove(
          "hidden"
        );
      };

    reader.readAsDataURL(file);
  };


// ===============================
// ADD / EDIT PRODUCT
// ===============================

productForm.onsubmit =
  async function (event) {

    event.preventDefault();

    const priceSmall =
      getPriceInput(
        "priceSmall"
      );

    const priceRegular =
      getPriceInput(
        "priceRegular"
      );

    const priceSmallDubai =
      getPriceInput(
        "priceSmallDubai"
      );

    const priceRegularDubai =
      getPriceInput(
        "priceRegularDubai"
      );

    const name =
      document
        .getElementById("name")
        .value
        .trim();

    const category =
      document
        .getElementById("category")
        .value;

    const description =
      document
        .getElementById("description")
        .value
        .trim();

    const available =
      document
        .getElementById("available")
        .checked;

    if (!name) {

      alert(
        "Nama produk wajib diisi."
      );

      return;
    }

    if (
      !CATEGORIES.includes(category)
    ) {

      alert(
        "Kategori produk tidak valid."
      );

      return;
    }

    const prices = [
      {
        name: "Harga Small",
        value: priceSmall
      },
      {
        name: "Harga Regular",
        value: priceRegular
      },
      {
        name:
          "Harga Small + Dubai Chewy",
        value: priceSmallDubai
      },
      {
        name:
          "Harga Regular + Dubai Chewy",
        value: priceRegularDubai
      }
    ];

    for (const price of prices) {

      if (
        price.value !== null &&
        (
          !Number.isFinite(
            price.value
          ) ||
          price.value <= 0
        )
      ) {

        alert(
          price.name +
          " harus lebih dari 0."
        );

        return;
      }
    }

    if (
      priceSmall === null &&
      priceRegular === null &&
      priceSmallDubai === null &&
      priceRegularDubai === null
    ) {

      const lanjut =
        confirm(
          "Semua harga masih kosong. " +
          "Tetap simpan produk?"
        );

      if (!lanjut) {
        return;
      }
    }
    
    const oldImageUrl = image || "";

    // UPLOAD GAMBAR KE SUPABASE STORAGE
    let imageUrl = image || "";

    const imageFile =
      document
        .getElementById("image")
        .files[0];

    if (imageFile) {

      if (imageFile.size > 2 * 1024 * 1024) {

        alert(
          "Ukuran gambar maksimal 2 MB."
        );

        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (
        !allowedTypes.includes(
          imageFile.type
        )
      ) {

        alert(
          "Format gambar harus JPG, PNG, atau WebP."
        );

        return;
      }

      const fileExt =
        imageFile.name
          .split(".")
          .pop()
          .toLowerCase();

      const fileName =
        `${crypto.randomUUID()}.${fileExt}`;

      const filePath =
        `products/${fileName}`;

      const {
        error: uploadError
      } = await db.storage
        .from("product-images")
        .upload(
          filePath,
          imageFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type
          }
        );

      if (uploadError) {

        console.error(
          "Gagal upload gambar:",
          uploadError
        );

        alert(
          "Gagal mengupload gambar."
        );

        return;
      }

      const {
        data: publicUrlData
      } = db.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl =
        publicUrlData.publicUrl;
    }

    const productData = {

      name,

      category,

      price_small:
        priceSmall,

      price_regular:
        priceRegular,

      price_small_dubai:
        priceSmallDubai,

      price_regular_dubai:
        priceRegularDubai,

      image: 
        imageUrl,

      description,

      available
    };


    // EDIT
    // EDIT
    if (editId) {

      const {
        error
      } = await db
        .from("products")
        .update(productData)
        .eq("id", editId);

      if (error) {

        console.error(error);

        alert(
          "Gagal memperbarui produk."
        );

        return;
      }

      // HAPUS GAMBAR LAMA JIKA GAMBAR DIGANTI
      if (
        imageFile &&
        oldImageUrl &&
        oldImageUrl.includes(
          "/storage/v1/object/public/product-images/"
        )
      ) {

        const oldPath =
          oldImageUrl.split(
            "/storage/v1/object/public/product-images/"
          )[1];

        if (oldPath) {

          const {
            error: deleteError
          } = await db.storage
            .from("product-images")
            .remove([oldPath]);

          if (deleteError) {

            console.error(
              "Gagal menghapus gambar lama:",
              deleteError
            );

          }

        }

      }

      alert(
        "Produk berhasil diperbarui."
      );

    }


    // TAMBAH
    else {

      const {
        error
      } = await db
        .from("products")
        .insert(productData);

      if (error) {

        console.error(error);

        alert(
          "Gagal menambahkan produk."
        );

        return;
      }

      alert(
        "Produk berhasil ditambahkan."
      );
    }

    await loadProducts();

    reset();

    render();
  };


// ===============================
// RESET FORM
// ===============================

document.getElementById(
  "cancel"
).onclick = reset;


function reset() {

  editId = null;

  image = "";

  productForm.reset();

  document.getElementById(
    "available"
  ).checked = true;

  document.getElementById(
    "formTitle"
  ).textContent =
    "Tambah Produk";

  document.getElementById(
    "save"
  ).textContent =
    "Tambah Produk";

  document
    .getElementById("cancel")
    .classList.add("hidden");

  document
    .getElementById("preview")
    .classList.add("hidden");

  document.getElementById(
    "preview"
  ).innerHTML = "";
}


// ===============================
// EDIT
// ===============================

async function edit(id) {

  const product =
    list.find(
      item =>
        item.id === id
    );

  if (!product) {
    return;
  }

  editId = id;

  image =
    product.image || "";

  document.getElementById(
    "name"
  ).value =
    product.name || "";

  document.getElementById(
    "priceSmall"
  ).value =
    product.price_small ?? "";

  document.getElementById(
    "priceRegular"
  ).value =
    product.price_regular ?? "";

  document.getElementById(
    "priceSmallDubai"
  ).value =
    product.price_small_dubai ?? "";

  document.getElementById(
    "priceRegularDubai"
  ).value =
    product.price_regular_dubai ?? "";

  document.getElementById(
    "category"
  ).value =
    normalizeCategory(
      product.category
    );

  document.getElementById(
    "description"
  ).value =
    product.description || "";

  document.getElementById(
    "available"
  ).checked =
    product.available;

  document.getElementById(
    "formTitle"
  ).textContent =
    "Edit Produk";

  document.getElementById(
    "save"
  ).textContent =
    "Simpan Perubahan";

  document
    .getElementById("cancel")
    .classList.remove("hidden");

  if (image) {

    document.getElementById(
      "preview"
    ).innerHTML =
      `<img
        src="${esc(image)}"
        alt="Preview produk"
      >`;

    document
      .getElementById("preview")
      .classList.remove(
        "hidden"
      );

  } else {

    document
      .getElementById("preview")
      .classList.add(
        "hidden"
      );

    document.getElementById(
      "preview"
    ).innerHTML = "";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ===============================
// DELETE
// ===============================

async function del(id) {

  const product =
    list.find(
      item =>
        item.id === id
    );

  if (!product) {
    return;
  }

  const yakin =
    confirm(
      `Hapus produk "${product.name}"?`
    );

  if (!yakin) {
    return;
  }

  const {
    error
  } = await db
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);

    alert(
      "Gagal menghapus produk."
    );

    return;
  }

  await loadProducts();

  render();
}


// ===============================
// TOGGLE AVAILABLE
// ===============================

async function toggle(id) {

  const product =
    list.find(
      item =>
        item.id === id
    );

  if (!product) {
    return;
  }

  const {
    error
  } = await db
    .from("products")
    .update({
      available:
        !product.available
    })
    .eq("id", id);

  if (error) {

    console.error(error);

    alert(
      "Gagal mengubah status produk."
    );

    return;
  }

  await loadProducts();

  render();
}


// ===============================
// RENDER
// ===============================

function render() {

  document.getElementById(
    "total"
  ).textContent =
    list.length;

  document.getElementById(
    "active"
  ).textContent =
    list.filter(
      product =>
        product.available
    ).length;

  document.getElementById(
    "categoryCount"
  ).textContent =
    new Set(
      list.map(
        product =>
          normalizeCategory(
            product.category
          )
      )
    ).size;

  document.getElementById(
    "list"
  ).innerHTML =

    list.map(
      product => `

        <div class="item">

          <div class="thumb">

            ${
              product.image
                ? `<img
                     src="${esc(
                       product.image
                     )}"
                     alt="${esc(
                       product.name
                     )}"
                   >`
                : "🍓"
            }

          </div>

          <div>

            <b>
              ${esc(
                product.name
              )}
            </b>

            <br>

            <small>

              ${esc(
                normalizeCategory(
                  product.category
                )
              )}

              <br>

              ${
                product.price_small
                  ? `Small: ${rp(
                      product.price_small
                    )}<br>`
                  : ""
              }

              ${
                product.price_regular
                  ? `Regular: ${rp(
                      product.price_regular
                    )}<br>`
                  : ""
              }

              ${
                product.price_small_dubai
                  ? `Small + Dubai Chewy: ${rp(
                      product.price_small_dubai
                    )}<br>`
                  : ""
              }

              ${
                product.price_regular_dubai
                  ? `Regular + Dubai Chewy: ${rp(
                      product.price_regular_dubai
                    )}<br>`
                  : ""
              }

              ${
                !product.price_small &&
                !product.price_regular &&
                !product.price_small_dubai &&
                !product.price_regular_dubai
                  ? "Harga belum diisi<br>"
                  : ""
              }

              ${
                product.available
                  ? "Tersedia"
                  : "Habis"
              }

            </small>

          </div>

          <div class="actions">

            <button
              class="btn secondary"
              onclick="edit('${product.id}')"
            >
              Edit
            </button>

            <button
              class="btn secondary"
              onclick="toggle('${product.id}')"
            >
              ${
                product.available
                  ? "Nonaktifkan"
                  : "Aktifkan"
              }
            </button>

            <button
              class="btn danger"
              onclick="del('${product.id}')"
            >
              Hapus
            </button>

          </div>

        </div>

      `
    ).join("");
}


// ===============================
// SETTINGS
// ===============================

function fillSettings() {

  document.getElementById(
    "sName"
  ).value =
    settings.name || "";

  document.getElementById(
    "sWa"
  ).value =
    settings.whatsapp || "";

  document.getElementById(
    "sIg"
  ).value =
    settings.instagram || "";

  document.getElementById(
    "sHours"
  ).value =
    settings.hours || "";

  document.getElementById(
    "sTagline"
  ).value =
    settings.tagline || "";

  document.getElementById(
    "sDesc"
  ).value =
    settings.description || "";

  document.getElementById(
    "sAddress"
  ).value =
    settings.address || "";
}


// ===============================
// SAVE SETTINGS
// ===============================

settingsForm.onsubmit = async function (event) {
  event.preventDefault();

  const settingsData = {
    name: document.getElementById("sName").value.trim(),
    whatsapp: document.getElementById("sWa").value.trim(),
    instagram: document.getElementById("sIg").value.trim(),
    hours: document.getElementById("sHours").value.trim(),
    tagline: document.getElementById("sTagline").value.trim(),
    description: document.getElementById("sDesc").value.trim(),
    address: document.getElementById("sAddress").value.trim()
  };

  console.log("Data settings:", settingsData);

  try {
    // Ambil ID settings yang sudah ada
    const { data: currentSettings, error: getError } = await db
      .from("store_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (getError) {
      console.error("Gagal mengambil settings:", getError);
      alert("Gagal mengambil data pengaturan toko.");
      return;
    }

    let result;

    if (currentSettings && currentSettings.id) {
      // Jika data sudah ada → UPDATE
      result = await db
        .from("store_settings")
        .update(settingsData)
        .eq("id", currentSettings.id)
        .select()
        .single();
    } else {
      // Jika belum ada → INSERT
      result = await db
        .from("store_settings")
        .insert(settingsData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("Gagal menyimpan settings:", result.error);
      alert("Gagal menyimpan pengaturan toko.");
      return;
    }

    console.log("Settings berhasil disimpan:", result.data);

    alert("Pengaturan toko berhasil disimpan.");

    await loadSettings();

  } catch (error) {
    console.error("Error settings:", error);
    alert("Terjadi kesalahan saat menyimpan pengaturan toko.");
  }
};

// ===============================
// START
// ===============================

checkSession();