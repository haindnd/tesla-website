<?php
// Kết nối database
$conn = mysqli_connect("localhost", "root", "", "dat_tesla_motors");

// Kiểm tra kết nối
if (!$conn) {
    die("Kết nối thất bại: " . mysqli_connect_error());
}

// Lấy trang hiện tại
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 6;
$start = ($page - 1) * $limit;

// Lấy sản phẩm theo trang
$sql = "SELECT * FROM products LIMIT $start, $limit";
$result = mysqli_query($conn, $sql);

// Đếm tổng sản phẩm
$total_sql = "SELECT COUNT(*) as total FROM products";
$total_result = mysqli_query($conn, $total_sql);
$total_row = mysqli_fetch_assoc($total_result);
$total_pages = ceil($total_row['total'] / $limit);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Sản phẩm - ĐẠT TESLA</title>

    <!-- CSS (đã sửa đúng) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

<!-- HEADER -->
<header style="padding:20px; background:#111; color:#fff; text-align:center;">
    <h2>ĐẠT TESLA MOTORS</h2>
</header>

<!-- PRODUCTS -->
<section class="section">
    <div class="products-grid">

        <?php while($row = mysqli_fetch_assoc($result)) { ?>
            <div class="product-card">
                <img src="<?php echo $row['image']; ?>" style="width:100%;">
                <h5><?php echo $row['name']; ?></h5>
                <p><?php echo number_format($row['price']); ?> VNĐ</p>
            </div>
        <?php } ?>

    </div>
</section>

<!-- PAGINATION -->
<div class="pagination" style="text-align:center; margin:20px;">
    <?php for($i = 1; $i <= $total_pages; $i++) { ?>
        <a href="?page=<?php echo $i; ?>" 
           style="margin:5px; padding:8px 12px; border:1px solid #ccc; text-decoration:none;
           <?php if($i == $page) echo 'background:black;color:white;'; ?>">
            <?php echo $i; ?>
        </a>
    <?php } ?>
</div>

</body>
</html>