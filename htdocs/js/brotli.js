jQuery(function ($) {
	const ALPHABET_SIZE_BLOCK_COUNT = 26;
	const ALPHABET_SIZE_LITERALS = 256;
	const ALPHABET_SIZE_INSERT_AND_COPY_LENGTHS = 704;
	// translates an insert-and-copy length symbol to ((insert length, extra bits), (copy length, extra bits))
	const INSERT_LENGTHS_AND_COPY_LENGTHS = [
		[[    0,  0], [   2,  0]], [[    0,  0], [   3,  0]], [[    0,  0], [   4,  0]], [[    0,  0], [   5,  0]],
		[[    0,  0], [   6,  0]], [[    0,  0], [   7,  0]], [[    0,  0], [   8,  0]], [[    0,  0], [   9,  0]],
		[[    1,  0], [   2,  0]], [[    1,  0], [   3,  0]], [[    1,  0], [   4,  0]], [[    1,  0], [   5,  0]],
		[[    1,  0], [   6,  0]], [[    1,  0], [   7,  0]], [[    1,  0], [   8,  0]], [[    1,  0], [   9,  0]],
		[[    2,  0], [   2,  0]], [[    2,  0], [   3,  0]], [[    2,  0], [   4,  0]], [[    2,  0], [   5,  0]],
		[[    2,  0], [   6,  0]], [[    2,  0], [   7,  0]], [[    2,  0], [   8,  0]], [[    2,  0], [   9,  0]],
		[[    3,  0], [   2,  0]], [[    3,  0], [   3,  0]], [[    3,  0], [   4,  0]], [[    3,  0], [   5,  0]],
		[[    3,  0], [   6,  0]], [[    3,  0], [   7,  0]], [[    3,  0], [   8,  0]], [[    3,  0], [   9,  0]],
		[[    4,  0], [   2,  0]], [[    4,  0], [   3,  0]], [[    4,  0], [   4,  0]], [[    4,  0], [   5,  0]],
		[[    4,  0], [   6,  0]], [[    4,  0], [   7,  0]], [[    4,  0], [   8,  0]], [[    4,  0], [   9,  0]],
		[[    5,  0], [   2,  0]], [[    5,  0], [   3,  0]], [[    5,  0], [   4,  0]], [[    5,  0], [   5,  0]],
		[[    5,  0], [   6,  0]], [[    5,  0], [   7,  0]], [[    5,  0], [   8,  0]], [[    5,  0], [   9,  0]],
		[[    6,  1], [   2,  0]], [[    6,  1], [   3,  0]], [[    6,  1], [   4,  0]], [[    6,  1], [   5,  0]],
		[[    6,  1], [   6,  0]], [[    6,  1], [   7,  0]], [[    6,  1], [   8,  0]], [[    6,  1], [   9,  0]],
		[[    8,  1], [   2,  0]], [[    8,  1], [   3,  0]], [[    8,  1], [   4,  0]], [[    8,  1], [   5,  0]],
		[[    8,  1], [   6,  0]], [[    8,  1], [   7,  0]], [[    8,  1], [   8,  0]], [[    8,  1], [   9,  0]],
		[[    0,  0], [  10,  1]], [[    0,  0], [  12,  1]], [[    0,  0], [  14,  2]], [[    0,  0], [  18,  2]],
		[[    0,  0], [  22,  3]], [[    0,  0], [  30,  3]], [[    0,  0], [  38,  4]], [[    0,  0], [  54,  4]],
		[[    1,  0], [  10,  1]], [[    1,  0], [  12,  1]], [[    1,  0], [  14,  2]], [[    1,  0], [  18,  2]],
		[[    1,  0], [  22,  3]], [[    1,  0], [  30,  3]], [[    1,  0], [  38,  4]], [[    1,  0], [  54,  4]],
		[[    2,  0], [  10,  1]], [[    2,  0], [  12,  1]], [[    2,  0], [  14,  2]], [[    2,  0], [  18,  2]],
		[[    2,  0], [  22,  3]], [[    2,  0], [  30,  3]], [[    2,  0], [  38,  4]], [[    2,  0], [  54,  4]],
		[[    3,  0], [  10,  1]], [[    3,  0], [  12,  1]], [[    3,  0], [  14,  2]], [[    3,  0], [  18,  2]],
		[[    3,  0], [  22,  3]], [[    3,  0], [  30,  3]], [[    3,  0], [  38,  4]], [[    3,  0], [  54,  4]],
		[[    4,  0], [  10,  1]], [[    4,  0], [  12,  1]], [[    4,  0], [  14,  2]], [[    4,  0], [  18,  2]],
		[[    4,  0], [  22,  3]], [[    4,  0], [  30,  3]], [[    4,  0], [  38,  4]], [[    4,  0], [  54,  4]],
		[[    5,  0], [  10,  1]], [[    5,  0], [  12,  1]], [[    5,  0], [  14,  2]], [[    5,  0], [  18,  2]],
		[[    5,  0], [  22,  3]], [[    5,  0], [  30,  3]], [[    5,  0], [  38,  4]], [[    5,  0], [  54,  4]],
		[[    6,  1], [  10,  1]], [[    6,  1], [  12,  1]], [[    6,  1], [  14,  2]], [[    6,  1], [  18,  2]],
		[[    6,  1], [  22,  3]], [[    6,  1], [  30,  3]], [[    6,  1], [  38,  4]], [[    6,  1], [  54,  4]],
		[[    8,  1], [  10,  1]], [[    8,  1], [  12,  1]], [[    8,  1], [  14,  2]], [[    8,  1], [  18,  2]],
		[[    8,  1], [  22,  3]], [[    8,  1], [  30,  3]], [[    8,  1], [  38,  4]], [[    8,  1], [  54,  4]],
		[[    0,  0], [   2,  0]], [[    0,  0], [   3,  0]], [[    0,  0], [   4,  0]], [[    0,  0], [   5,  0]],
		[[    0,  0], [   6,  0]], [[    0,  0], [   7,  0]], [[    0,  0], [   8,  0]], [[    0,  0], [   9,  0]],
		[[    1,  0], [   2,  0]], [[    1,  0], [   3,  0]], [[    1,  0], [   4,  0]], [[    1,  0], [   5,  0]],
		[[    1,  0], [   6,  0]], [[    1,  0], [   7,  0]], [[    1,  0], [   8,  0]], [[    1,  0], [   9,  0]],
		[[    2,  0], [   2,  0]], [[    2,  0], [   3,  0]], [[    2,  0], [   4,  0]], [[    2,  0], [   5,  0]],
		[[    2,  0], [   6,  0]], [[    2,  0], [   7,  0]], [[    2,  0], [   8,  0]], [[    2,  0], [   9,  0]],
		[[    3,  0], [   2,  0]], [[    3,  0], [   3,  0]], [[    3,  0], [   4,  0]], [[    3,  0], [   5,  0]],
		[[    3,  0], [   6,  0]], [[    3,  0], [   7,  0]], [[    3,  0], [   8,  0]], [[    3,  0], [   9,  0]],
		[[    4,  0], [   2,  0]], [[    4,  0], [   3,  0]], [[    4,  0], [   4,  0]], [[    4,  0], [   5,  0]],
		[[    4,  0], [   6,  0]], [[    4,  0], [   7,  0]], [[    4,  0], [   8,  0]], [[    4,  0], [   9,  0]],
		[[    5,  0], [   2,  0]], [[    5,  0], [   3,  0]], [[    5,  0], [   4,  0]], [[    5,  0], [   5,  0]],
		[[    5,  0], [   6,  0]], [[    5,  0], [   7,  0]], [[    5,  0], [   8,  0]], [[    5,  0], [   9,  0]],
		[[    6,  1], [   2,  0]], [[    6,  1], [   3,  0]], [[    6,  1], [   4,  0]], [[    6,  1], [   5,  0]],
		[[    6,  1], [   6,  0]], [[    6,  1], [   7,  0]], [[    6,  1], [   8,  0]], [[    6,  1], [   9,  0]],
		[[    8,  1], [   2,  0]], [[    8,  1], [   3,  0]], [[    8,  1], [   4,  0]], [[    8,  1], [   5,  0]],
		[[    8,  1], [   6,  0]], [[    8,  1], [   7,  0]], [[    8,  1], [   8,  0]], [[    8,  1], [   9,  0]],
		[[    0,  0], [  10,  1]], [[    0,  0], [  12,  1]], [[    0,  0], [  14,  2]], [[    0,  0], [  18,  2]],
		[[    0,  0], [  22,  3]], [[    0,  0], [  30,  3]], [[    0,  0], [  38,  4]], [[    0,  0], [  54,  4]],
		[[    1,  0], [  10,  1]], [[    1,  0], [  12,  1]], [[    1,  0], [  14,  2]], [[    1,  0], [  18,  2]],
		[[    1,  0], [  22,  3]], [[    1,  0], [  30,  3]], [[    1,  0], [  38,  4]], [[    1,  0], [  54,  4]],
		[[    2,  0], [  10,  1]], [[    2,  0], [  12,  1]], [[    2,  0], [  14,  2]], [[    2,  0], [  18,  2]],
		[[    2,  0], [  22,  3]], [[    2,  0], [  30,  3]], [[    2,  0], [  38,  4]], [[    2,  0], [  54,  4]],
		[[    3,  0], [  10,  1]], [[    3,  0], [  12,  1]], [[    3,  0], [  14,  2]], [[    3,  0], [  18,  2]],
		[[    3,  0], [  22,  3]], [[    3,  0], [  30,  3]], [[    3,  0], [  38,  4]], [[    3,  0], [  54,  4]],
		[[    4,  0], [  10,  1]], [[    4,  0], [  12,  1]], [[    4,  0], [  14,  2]], [[    4,  0], [  18,  2]],
		[[    4,  0], [  22,  3]], [[    4,  0], [  30,  3]], [[    4,  0], [  38,  4]], [[    4,  0], [  54,  4]],
		[[    5,  0], [  10,  1]], [[    5,  0], [  12,  1]], [[    5,  0], [  14,  2]], [[    5,  0], [  18,  2]],
		[[    5,  0], [  22,  3]], [[    5,  0], [  30,  3]], [[    5,  0], [  38,  4]], [[    5,  0], [  54,  4]],
		[[    6,  1], [  10,  1]], [[    6,  1], [  12,  1]], [[    6,  1], [  14,  2]], [[    6,  1], [  18,  2]],
		[[    6,  1], [  22,  3]], [[    6,  1], [  30,  3]], [[    6,  1], [  38,  4]], [[    6,  1], [  54,  4]],
		[[    8,  1], [  10,  1]], [[    8,  1], [  12,  1]], [[    8,  1], [  14,  2]], [[    8,  1], [  18,  2]],
		[[    8,  1], [  22,  3]], [[    8,  1], [  30,  3]], [[    8,  1], [  38,  4]], [[    8,  1], [  54,  4]],
		[[   10,  2], [   2,  0]], [[   10,  2], [   3,  0]], [[   10,  2], [   4,  0]], [[   10,  2], [   5,  0]],
		[[   10,  2], [   6,  0]], [[   10,  2], [   7,  0]], [[   10,  2], [   8,  0]], [[   10,  2], [   9,  0]],
		[[   14,  2], [   2,  0]], [[   14,  2], [   3,  0]], [[   14,  2], [   4,  0]], [[   14,  2], [   5,  0]],
		[[   14,  2], [   6,  0]], [[   14,  2], [   7,  0]], [[   14,  2], [   8,  0]], [[   14,  2], [   9,  0]],
		[[   18,  3], [   2,  0]], [[   18,  3], [   3,  0]], [[   18,  3], [   4,  0]], [[   18,  3], [   5,  0]],
		[[   18,  3], [   6,  0]], [[   18,  3], [   7,  0]], [[   18,  3], [   8,  0]], [[   18,  3], [   9,  0]],
		[[   26,  3], [   2,  0]], [[   26,  3], [   3,  0]], [[   26,  3], [   4,  0]], [[   26,  3], [   5,  0]],
		[[   26,  3], [   6,  0]], [[   26,  3], [   7,  0]], [[   26,  3], [   8,  0]], [[   26,  3], [   9,  0]],
		[[   34,  4], [   2,  0]], [[   34,  4], [   3,  0]], [[   34,  4], [   4,  0]], [[   34,  4], [   5,  0]],
		[[   34,  4], [   6,  0]], [[   34,  4], [   7,  0]], [[   34,  4], [   8,  0]], [[   34,  4], [   9,  0]],
		[[   50,  4], [   2,  0]], [[   50,  4], [   3,  0]], [[   50,  4], [   4,  0]], [[   50,  4], [   5,  0]],
		[[   50,  4], [   6,  0]], [[   50,  4], [   7,  0]], [[   50,  4], [   8,  0]], [[   50,  4], [   9,  0]],
		[[   66,  5], [   2,  0]], [[   66,  5], [   3,  0]], [[   66,  5], [   4,  0]], [[   66,  5], [   5,  0]],
		[[   66,  5], [   6,  0]], [[   66,  5], [   7,  0]], [[   66,  5], [   8,  0]], [[   66,  5], [   9,  0]],
		[[   98,  5], [   2,  0]], [[   98,  5], [   3,  0]], [[   98,  5], [   4,  0]], [[   98,  5], [   5,  0]],
		[[   98,  5], [   6,  0]], [[   98,  5], [   7,  0]], [[   98,  5], [   8,  0]], [[   98,  5], [   9,  0]],
		[[   10,  2], [  10,  1]], [[   10,  2], [  12,  1]], [[   10,  2], [  14,  2]], [[   10,  2], [  18,  2]],
		[[   10,  2], [  22,  3]], [[   10,  2], [  30,  3]], [[   10,  2], [  38,  4]], [[   10,  2], [  54,  4]],
		[[   14,  2], [  10,  1]], [[   14,  2], [  12,  1]], [[   14,  2], [  14,  2]], [[   14,  2], [  18,  2]],
		[[   14,  2], [  22,  3]], [[   14,  2], [  30,  3]], [[   14,  2], [  38,  4]], [[   14,  2], [  54,  4]],
		[[   18,  3], [  10,  1]], [[   18,  3], [  12,  1]], [[   18,  3], [  14,  2]], [[   18,  3], [  18,  2]],
		[[   18,  3], [  22,  3]], [[   18,  3], [  30,  3]], [[   18,  3], [  38,  4]], [[   18,  3], [  54,  4]],
		[[   26,  3], [  10,  1]], [[   26,  3], [  12,  1]], [[   26,  3], [  14,  2]], [[   26,  3], [  18,  2]],
		[[   26,  3], [  22,  3]], [[   26,  3], [  30,  3]], [[   26,  3], [  38,  4]], [[   26,  3], [  54,  4]],
		[[   34,  4], [  10,  1]], [[   34,  4], [  12,  1]], [[   34,  4], [  14,  2]], [[   34,  4], [  18,  2]],
		[[   34,  4], [  22,  3]], [[   34,  4], [  30,  3]], [[   34,  4], [  38,  4]], [[   34,  4], [  54,  4]],
		[[   50,  4], [  10,  1]], [[   50,  4], [  12,  1]], [[   50,  4], [  14,  2]], [[   50,  4], [  18,  2]],
		[[   50,  4], [  22,  3]], [[   50,  4], [  30,  3]], [[   50,  4], [  38,  4]], [[   50,  4], [  54,  4]],
		[[   66,  5], [  10,  1]], [[   66,  5], [  12,  1]], [[   66,  5], [  14,  2]], [[   66,  5], [  18,  2]],
		[[   66,  5], [  22,  3]], [[   66,  5], [  30,  3]], [[   66,  5], [  38,  4]], [[   66,  5], [  54,  4]],
		[[   98,  5], [  10,  1]], [[   98,  5], [  12,  1]], [[   98,  5], [  14,  2]], [[   98,  5], [  18,  2]],
		[[   98,  5], [  22,  3]], [[   98,  5], [  30,  3]], [[   98,  5], [  38,  4]], [[   98,  5], [  54,  4]],
		[[    0,  0], [  70,  5]], [[    0,  0], [ 102,  5]], [[    0,  0], [ 134,  6]], [[    0,  0], [ 198,  7]],
		[[    0,  0], [ 326,  8]], [[    0,  0], [ 582,  9]], [[    0,  0], [1094, 10]], [[    0,  0], [2118, 24]],
		[[    1,  0], [  70,  5]], [[    1,  0], [ 102,  5]], [[    1,  0], [ 134,  6]], [[    1,  0], [ 198,  7]],
		[[    1,  0], [ 326,  8]], [[    1,  0], [ 582,  9]], [[    1,  0], [1094, 10]], [[    1,  0], [2118, 24]],
		[[    2,  0], [  70,  5]], [[    2,  0], [ 102,  5]], [[    2,  0], [ 134,  6]], [[    2,  0], [ 198,  7]],
		[[    2,  0], [ 326,  8]], [[    2,  0], [ 582,  9]], [[    2,  0], [1094, 10]], [[    2,  0], [2118, 24]],
		[[    3,  0], [  70,  5]], [[    3,  0], [ 102,  5]], [[    3,  0], [ 134,  6]], [[    3,  0], [ 198,  7]],
		[[    3,  0], [ 326,  8]], [[    3,  0], [ 582,  9]], [[    3,  0], [1094, 10]], [[    3,  0], [2118, 24]],
		[[    4,  0], [  70,  5]], [[    4,  0], [ 102,  5]], [[    4,  0], [ 134,  6]], [[    4,  0], [ 198,  7]],
		[[    4,  0], [ 326,  8]], [[    4,  0], [ 582,  9]], [[    4,  0], [1094, 10]], [[    4,  0], [2118, 24]],
		[[    5,  0], [  70,  5]], [[    5,  0], [ 102,  5]], [[    5,  0], [ 134,  6]], [[    5,  0], [ 198,  7]],
		[[    5,  0], [ 326,  8]], [[    5,  0], [ 582,  9]], [[    5,  0], [1094, 10]], [[    5,  0], [2118, 24]],
		[[    6,  1], [  70,  5]], [[    6,  1], [ 102,  5]], [[    6,  1], [ 134,  6]], [[    6,  1], [ 198,  7]],
		[[    6,  1], [ 326,  8]], [[    6,  1], [ 582,  9]], [[    6,  1], [1094, 10]], [[    6,  1], [2118, 24]],
		[[    8,  1], [  70,  5]], [[    8,  1], [ 102,  5]], [[    8,  1], [ 134,  6]], [[    8,  1], [ 198,  7]],
		[[    8,  1], [ 326,  8]], [[    8,  1], [ 582,  9]], [[    8,  1], [1094, 10]], [[    8,  1], [2118, 24]],
		[[  130,  6], [   2,  0]], [[  130,  6], [   3,  0]], [[  130,  6], [   4,  0]], [[  130,  6], [   5,  0]],
		[[  130,  6], [   6,  0]], [[  130,  6], [   7,  0]], [[  130,  6], [   8,  0]], [[  130,  6], [   9,  0]],
		[[  194,  7], [   2,  0]], [[  194,  7], [   3,  0]], [[  194,  7], [   4,  0]], [[  194,  7], [   5,  0]],
		[[  194,  7], [   6,  0]], [[  194,  7], [   7,  0]], [[  194,  7], [   8,  0]], [[  194,  7], [   9,  0]],
		[[  322,  8], [   2,  0]], [[  322,  8], [   3,  0]], [[  322,  8], [   4,  0]], [[  322,  8], [   5,  0]],
		[[  322,  8], [   6,  0]], [[  322,  8], [   7,  0]], [[  322,  8], [   8,  0]], [[  322,  8], [   9,  0]],
		[[  578,  9], [   2,  0]], [[  578,  9], [   3,  0]], [[  578,  9], [   4,  0]], [[  578,  9], [   5,  0]],
		[[  578,  9], [   6,  0]], [[  578,  9], [   7,  0]], [[  578,  9], [   8,  0]], [[  578,  9], [   9,  0]],
		[[ 1090, 10], [   2,  0]], [[ 1090, 10], [   3,  0]], [[ 1090, 10], [   4,  0]], [[ 1090, 10], [   5,  0]],
		[[ 1090, 10], [   6,  0]], [[ 1090, 10], [   7,  0]], [[ 1090, 10], [   8,  0]], [[ 1090, 10], [   9,  0]],
		[[ 2114, 12], [   2,  0]], [[ 2114, 12], [   3,  0]], [[ 2114, 12], [   4,  0]], [[ 2114, 12], [   5,  0]],
		[[ 2114, 12], [   6,  0]], [[ 2114, 12], [   7,  0]], [[ 2114, 12], [   8,  0]], [[ 2114, 12], [   9,  0]],
		[[ 6210, 14], [   2,  0]], [[ 6210, 14], [   3,  0]], [[ 6210, 14], [   4,  0]], [[ 6210, 14], [   5,  0]],
		[[ 6210, 14], [   6,  0]], [[ 6210, 14], [   7,  0]], [[ 6210, 14], [   8,  0]], [[ 6210, 14], [   9,  0]],
		[[22594, 24], [   2,  0]], [[22594, 24], [   3,  0]], [[22594, 24], [   4,  0]], [[22594, 24], [   5,  0]],
		[[22594, 24], [   6,  0]], [[22594, 24], [   7,  0]], [[22594, 24], [   8,  0]], [[22594, 24], [   9,  0]],
		[[   10,  2], [  70,  5]], [[   10,  2], [ 102,  5]], [[   10,  2], [ 134,  6]], [[   10,  2], [ 198,  7]],
		[[   10,  2], [ 326,  8]], [[   10,  2], [ 582,  9]], [[   10,  2], [1094, 10]], [[   10,  2], [2118, 24]],
		[[   14,  2], [  70,  5]], [[   14,  2], [ 102,  5]], [[   14,  2], [ 134,  6]], [[   14,  2], [ 198,  7]],
		[[   14,  2], [ 326,  8]], [[   14,  2], [ 582,  9]], [[   14,  2], [1094, 10]], [[   14,  2], [2118, 24]],
		[[   18,  3], [  70,  5]], [[   18,  3], [ 102,  5]], [[   18,  3], [ 134,  6]], [[   18,  3], [ 198,  7]],
		[[   18,  3], [ 326,  8]], [[   18,  3], [ 582,  9]], [[   18,  3], [1094, 10]], [[   18,  3], [2118, 24]],
		[[   26,  3], [  70,  5]], [[   26,  3], [ 102,  5]], [[   26,  3], [ 134,  6]], [[   26,  3], [ 198,  7]],
		[[   26,  3], [ 326,  8]], [[   26,  3], [ 582,  9]], [[   26,  3], [1094, 10]], [[   26,  3], [2118, 24]],
		[[   34,  4], [  70,  5]], [[   34,  4], [ 102,  5]], [[   34,  4], [ 134,  6]], [[   34,  4], [ 198,  7]],
		[[   34,  4], [ 326,  8]], [[   34,  4], [ 582,  9]], [[   34,  4], [1094, 10]], [[   34,  4], [2118, 24]],
		[[   50,  4], [  70,  5]], [[   50,  4], [ 102,  5]], [[   50,  4], [ 134,  6]], [[   50,  4], [ 198,  7]],
		[[   50,  4], [ 326,  8]], [[   50,  4], [ 582,  9]], [[   50,  4], [1094, 10]], [[   50,  4], [2118, 24]],
		[[   66,  5], [  70,  5]], [[   66,  5], [ 102,  5]], [[   66,  5], [ 134,  6]], [[   66,  5], [ 198,  7]],
		[[   66,  5], [ 326,  8]], [[   66,  5], [ 582,  9]], [[   66,  5], [1094, 10]], [[   66,  5], [2118, 24]],
		[[   98,  5], [  70,  5]], [[   98,  5], [ 102,  5]], [[   98,  5], [ 134,  6]], [[   98,  5], [ 198,  7]],
		[[   98,  5], [ 326,  8]], [[   98,  5], [ 582,  9]], [[   98,  5], [1094, 10]], [[   98,  5], [2118, 24]],
		[[  130,  6], [  10,  1]], [[  130,  6], [  12,  1]], [[  130,  6], [  14,  2]], [[  130,  6], [  18,  2]],
		[[  130,  6], [  22,  3]], [[  130,  6], [  30,  3]], [[  130,  6], [  38,  4]], [[  130,  6], [  54,  4]],
		[[  194,  7], [  10,  1]], [[  194,  7], [  12,  1]], [[  194,  7], [  14,  2]], [[  194,  7], [  18,  2]],
		[[  194,  7], [  22,  3]], [[  194,  7], [  30,  3]], [[  194,  7], [  38,  4]], [[  194,  7], [  54,  4]],
		[[  322,  8], [  10,  1]], [[  322,  8], [  12,  1]], [[  322,  8], [  14,  2]], [[  322,  8], [  18,  2]],
		[[  322,  8], [  22,  3]], [[  322,  8], [  30,  3]], [[  322,  8], [  38,  4]], [[  322,  8], [  54,  4]],
		[[  578,  9], [  10,  1]], [[  578,  9], [  12,  1]], [[  578,  9], [  14,  2]], [[  578,  9], [  18,  2]],
		[[  578,  9], [  22,  3]], [[  578,  9], [  30,  3]], [[  578,  9], [  38,  4]], [[  578,  9], [  54,  4]],
		[[ 1090, 10], [  10,  1]], [[ 1090, 10], [  12,  1]], [[ 1090, 10], [  14,  2]], [[ 1090, 10], [  18,  2]],
		[[ 1090, 10], [  22,  3]], [[ 1090, 10], [  30,  3]], [[ 1090, 10], [  38,  4]], [[ 1090, 10], [  54,  4]],
		[[ 2114, 12], [  10,  1]], [[ 2114, 12], [  12,  1]], [[ 2114, 12], [  14,  2]], [[ 2114, 12], [  18,  2]],
		[[ 2114, 12], [  22,  3]], [[ 2114, 12], [  30,  3]], [[ 2114, 12], [  38,  4]], [[ 2114, 12], [  54,  4]],
		[[ 6210, 14], [  10,  1]], [[ 6210, 14], [  12,  1]], [[ 6210, 14], [  14,  2]], [[ 6210, 14], [  18,  2]],
		[[ 6210, 14], [  22,  3]], [[ 6210, 14], [  30,  3]], [[ 6210, 14], [  38,  4]], [[ 6210, 14], [  54,  4]],
		[[22594, 24], [  10,  1]], [[22594, 24], [  12,  1]], [[22594, 24], [  14,  2]], [[22594, 24], [  18,  2]],
		[[22594, 24], [  22,  3]], [[22594, 24], [  30,  3]], [[22594, 24], [  38,  4]], [[22594, 24], [  54,  4]],
		[[  130,  6], [  70,  5]], [[  130,  6], [ 102,  5]], [[  130,  6], [ 134,  6]], [[  130,  6], [ 198,  7]],
		[[  130,  6], [ 326,  8]], [[  130,  6], [ 582,  9]], [[  130,  6], [1094, 10]], [[  130,  6], [2118, 24]],
		[[  194,  7], [  70,  5]], [[  194,  7], [ 102,  5]], [[  194,  7], [ 134,  6]], [[  194,  7], [ 198,  7]],
		[[  194,  7], [ 326,  8]], [[  194,  7], [ 582,  9]], [[  194,  7], [1094, 10]], [[  194,  7], [2118, 24]],
		[[  322,  8], [  70,  5]], [[  322,  8], [ 102,  5]], [[  322,  8], [ 134,  6]], [[  322,  8], [ 198,  7]],
		[[  322,  8], [ 326,  8]], [[  322,  8], [ 582,  9]], [[  322,  8], [1094, 10]], [[  322,  8], [2118, 24]],
		[[  578,  9], [  70,  5]], [[  578,  9], [ 102,  5]], [[  578,  9], [ 134,  6]], [[  578,  9], [ 198,  7]],
		[[  578,  9], [ 326,  8]], [[  578,  9], [ 582,  9]], [[  578,  9], [1094, 10]], [[  578,  9], [2118, 24]],
		[[ 1090, 10], [  70,  5]], [[ 1090, 10], [ 102,  5]], [[ 1090, 10], [ 134,  6]], [[ 1090, 10], [ 198,  7]],
		[[ 1090, 10], [ 326,  8]], [[ 1090, 10], [ 582,  9]], [[ 1090, 10], [1094, 10]], [[ 1090, 10], [2118, 24]],
		[[ 2114, 12], [  70,  5]], [[ 2114, 12], [ 102,  5]], [[ 2114, 12], [ 134,  6]], [[ 2114, 12], [ 198,  7]],
		[[ 2114, 12], [ 326,  8]], [[ 2114, 12], [ 582,  9]], [[ 2114, 12], [1094, 10]], [[ 2114, 12], [2118, 24]],
		[[ 6210, 14], [  70,  5]], [[ 6210, 14], [ 102,  5]], [[ 6210, 14], [ 134,  6]], [[ 6210, 14], [ 198,  7]],
		[[ 6210, 14], [ 326,  8]], [[ 6210, 14], [ 582,  9]], [[ 6210, 14], [1094, 10]], [[ 6210, 14], [2118, 24]],
		[[22594, 24], [  70,  5]], [[22594, 24], [ 102,  5]], [[22594, 24], [ 134,  6]], [[22594, 24], [ 198,  7]],
		[[22594, 24], [ 326,  8]], [[22594, 24], [ 582,  9]], [[22594, 24], [1094, 10]], [[22594, 24], [2118, 24]]
	];

	const LUT_0 = [
		 0,  0,  0,  0,  0,  0,  0,  0,  0,  4,  4,  0,  0,  4,  0,  0,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
		 8, 12, 16, 12, 12, 20, 12, 16, 24, 28, 12, 12, 32, 12, 36, 12,
		44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 32, 32, 24, 40, 28, 12,
		12, 48, 52, 52, 52, 48, 52, 52, 52, 48, 52, 52, 52, 52, 52, 48,
		52, 52, 52, 52, 52, 48, 52, 52, 52, 52, 52, 24, 12, 28, 12, 12,
		12, 56, 60, 60, 60, 56, 60, 60, 60, 56, 60, 60, 60, 60, 60, 56,
		60, 60, 60, 60, 60, 56, 60, 60, 60, 60, 60, 24, 12, 28, 12,  0,
		 0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,
		 0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,
		 0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,
		 0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,  0,  1,
		 2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,
		 2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,
		 2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,
		 2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3
	];

	const LUT_1 =[
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
		1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
		1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
	];

	const LUT_2 = [
		0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
		3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
		4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
		4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
		4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
		4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
		5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
		5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
		5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
		6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7
	];


	var
		$input = $("#input-hex"),
		$output = $("#output-bytes"),
		$annotation = $("#annotation");

	function unimplemented() {
		console.error("hit unimplemented()…");
	}

	function unreachable() {
		console.error("hit unreachable()…");
	}

	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			out_buf = [],
			p = shared.RingBuffer.fromArr([0, 0]),
			outputWindow,
			wbits, windowSize,
			metablock,
			endOfStream,
			reader,
			tmp,
			Entity, Metablock, PrefixCode, ContextMap;

		Entity = function (reader, id, parser, post) {
			this.reader = reader;

			this.id = id;
			this.bitIndex = {};
			this.parser = parser;
			this.post = post;
			this.error = false;
		};

		Entity.prototype.parse = function () {
			this.bitIndex.from = this.reader.globalBitIndex();

			this.setResult(this.parser());
			if (typeof this.result === "string") {
				this.error = true;
			} else {
				this.post();
			}

			this.bitIndex.to = this.reader.globalBitIndex();

			this.$el = $annotation.find("#" + this.id).clone().appendTo($annotation);
			this.$el.trigger("annotation/requested", this);

			return !this.error;
		};

		Entity.prototype.setBitIndex = function (bitIndex) {
			this.bitIndex = bitIndex;
		};

		Entity.prototype.setResult = function (result) {
			this.result = result;
		};

		function noop() {}

		function postMinimal() {
			if (/Array/.test(this.result.constructor.toString())) {
				this.result.toString = function () {
					return this.join(", ");
				};
			}
		}

		function postFillBits() {
			if (this.result > 0) {
				this.error = true;
				this.result = "Non-zero fill bits";
			}
		}

		function postNBlTypes() {
			var tmp = this.reader.readNBits(this.result[1]);

			if (typeof tmp === "string") {
				this.error = true;
				return;
			}

			this.result = this.result[0] + tmp;
		}

		function readBit() {
			return this.reader.readBit();
		}

		function readFillBits() {
			return this.reader.readFillBits();
		}

		function parseHTreeBLen () {
			return parserPrefixCode(this.reader, ALPHABET_SIZE_BLOCK_COUNT);
		}

		function lookupNBlTypes () {
			return shared.PrefixCode.bltype_codes.lookup(this.reader);
		}

		function write_out(bytes) {
			Array.prototype.push.apply(out_buf, bytes);

			$output.html(out_buf.map(function (b) { return "<span>" + b.toString(16) + "</span>"; }).join(""));
		}

		function decodeBlockCount(reader, blockCountCode) {
			var baseLength, extraBits;

			if (typeof blockCountCode === "string") {
				return blockCountCode;
			}

			if (blockCountCode <= 3) {
				baseLength = 1 + (blockCountCode << 2);
				extraBits = 2;
			} else if (blockCountCode <= 7) {
				baseLength = 17 + ((blockCountCode - 4) << 3);
				extraBits = 3;
			} else if (blockCountCode <= 11) {
				baseLength = 49 + ((blockCountCode - 8) << 4);
				extraBits = 4;
			} else if (blockCountCode <= 15) {
				baseLength = 113 + ((blockCountCode - 12) << 5);
				extraBits = 5;
			} else if (blockCountCode <= 17) {
				baseLength = 241 + ((blockCountCode - 16) << 6);
				extraBits = 6;
			} else if (blockCountCode === 18) {
				baseLength = 369;
				extraBits = 7;
			} else if (blockCountCode === 19) {
				baseLength = 497;
				extraBits = 8;
			} else if (blockCountCode === 20) {
				baseLength = 753;
				extraBits = 9;
			} else if (blockCountCode === 21) {
				baseLength = 1265;
				extraBits = 10;
			} else if (blockCountCode === 22) {
				baseLength = 2289;
				extraBits = 11;
			} else if (blockCountCode === 23) {
				baseLength = 4337;
				extraBits = 12;
			} else if (blockCountCode === 24) {
				baseLength = 8433;
				extraBits = 13;
			} else if (blockCountCode === 25) {
				baseLength = 16625;
				extraBits = 24;
			} else {
				unreachable();
			}

			extraBits = reader.readNBits(extraBits);

			if (typeof extraBits === "string") {
				return extraBits;
			}

			return baseLength + extraBits;
		}

		function parserPrefixCode(reader, alphabetSize) {
			var prefixCode = new PrefixCode(reader, alphabetSize);

			if (!prefixCode.hSkip.parse()) {
				return prefixCode.hSkip.result;
			}

			if (prefixCode.hSkip.result === 1) {
				if (!prefixCode.nSym.parse()) {
					return prefixCode.nSym.result;
				}

				if (!prefixCode.symbols.parse()) {
					return prefixCode.symbols.result;
				}

				if (prefixCode.nSym.result === 4) {
					if (!prefixCode.treeSelect.parse()) {
						return prefixCode.treeSelect.result;
					}
				}

				if (prefixCode.symbols.result.length >= 2) {
					(function () {
						var
							symbols = prefixCode.symbols.result,
							i = symbols.length - 2,
							j = symbols.length - 1,
							tmp;

						if (symbols[i] > symbols[j]) {
							tmp = symbols[i];
							symbols[i] = symbols[j];
							symbols[j] = tmp;
						}
					} ());
				}

				switch (prefixCode.nSym.result) {
					case 1:
						return shared.PrefixCode.fromRawData([], 1, prefixCode.symbols.result[0]);
					case 2:
						return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], prefixCode.symbols.result[1]], 2, prefixCode.symbols.result[1]);
					case 3:
						return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], null, null, null, prefixCode.symbols.result[1], prefixCode.symbols.result[2]], 3, prefixCode.symbols.result[2]);
					case 4:
						if (prefixCode.treeSelect.result === 0) {
							return shared.PrefixCode.fromRawData([null, null, null, prefixCode.symbols.result[0], prefixCode.symbols.result[1], prefixCode.symbols.result[2], prefixCode.symbols.result[3]], 4, prefixCode.symbols.result[3]);
						} else {
							return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], null, null, null, prefixCode.symbols.result[1], null, prefixCode.symbols.result[2], prefixCode.symbols.result[3]], 4, prefixCode.symbols.result[3]);
						}
					default:
						return "Invalid value for NSYM";
						break;
				}
			} else {
				if (!prefixCode.codelengthsUnsorted.parse()) {
					return prefixCode.codelengthsUnsorted.result;
				}

				if (!prefixCode.codelengths.parse()) {
					return prefixCode.codelengths.result;
				}

				if (!prefixCode.prefixCodeCodeLengths.parse()) {
					return prefixCode.prefixCodeCodeLengths.result;
				}

				if (!prefixCode.symbolsCodeLengths.parse()) {
					return prefixCode.symbolsCodeLengths.result;
				}

				return shared.PrefixCode.codesFromLengths(prefixCode.symbolsCodeLengths.result);
			}
		}

		PrefixCode = function (reader, alphabetSize) {
			var
				prefixCode = this,
				alphabetBits = (function () {
					var bitWidth;
					for (bitWidth = 0; alphabetSize > (1 << bitWidth); bitWidth += 1) {}
					return bitWidth;
				} ());

			this.reader = reader;

			this.hSkip = new Entity(this.reader, "hskip",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);

			this.nSym = new Entity(this.reader, "nsym",
				function () {
					return this.reader.readNBits(2);
				},
				function () {
					this.result += 1;
				});

			this.symbols = new Entity(this.reader, "symbols",
				function () {
					return this.reader.readNWords(prefixCode.nSym.result, alphabetBits);
				},
				function () {
					var i, j, l, m;
					if (Math.max.apply(Math, this.result) >= alphabetSize) {
						this.error = true
						this.result = "Invalid symbol in prefix code";
						return;
					} else {
						for (i = 0, l = this.result.length - 1; i < l; i += 1) {
							for (j = i + 1, m = this.result.length; j < m; j += 1) {
								if (this.result[i] === this.result[j]) {
									this.error = true;
									this.result = "Duplicate symbols";
									return;
								}
							}
						}
					}
				});

			this.treeSelect = new Entity(this.reader, "tree-select",
				function () {
					return this.reader.readBit();
				},
				postMinimal);

			this.codelengthsUnsorted = new Entity(this.reader, "codelengths-unsorted",
				function () {
					var
						codelengths = new Array(18).fill(0),
						sum = 0,
						lenNonZeroCodelengths = 0,
						i;

					for (i = prefixCode.hSkip.result; i < 18; i+= 1) {

						codelengths[i] = shared.PrefixCode.codelength_codes.lookup(this.reader);

						if (typeof codelengths[i] === "string") {
							return codelengths[i];
						};

						if (codelengths[i] > 0) {

							sum += 32 >> codelengths[i];
							lenNonZeroCodelengths += 1;

							if (sum === 32) {
								break;
							}

							if (sum > 32) {
								return "Codelengths checksum exceeds 32 in complex prefix code";
							}
						}
					}

					if (lenNonZeroCodelengths === 0) {
						return "Only zero codelengths found in complex prefix code";
					}

					if (lenNonZeroCodelengths >= 2 && sum < 32) {
						return "Codelengths checksum does not add up to 32 in complex prefix code";
					}

					return codelengths;
				},
				postMinimal);

			this.codelengths = new Entity(this.reader, "codelengths",
				function () {
					var codelengthsUnsorted = prefixCode.codelengthsUnsorted.result;

					this.bitIndex = prefixCode.codelengthsUnsorted.bitIndex;

					if (typeof codelengthsUnsorted === "string") {
						return codelengthsUnsorted;
					}

					return [codelengthsUnsorted[4], codelengthsUnsorted[0], codelengthsUnsorted[1], codelengthsUnsorted[2], codelengthsUnsorted[3], codelengthsUnsorted[5], codelengthsUnsorted[7], codelengthsUnsorted[9], codelengthsUnsorted[10], codelengthsUnsorted[11], codelengthsUnsorted[12], codelengthsUnsorted[13], codelengthsUnsorted[14], codelengthsUnsorted[15], codelengthsUnsorted[16], codelengthsUnsorted[17], codelengthsUnsorted[8], codelengthsUnsorted[6]];
				},
				postMinimal);

			this.prefixCodeCodeLengths = new Entity(this.reader, "prefixcode-codelengths",
				function () {
					this.bitIndex = prefixCode.codelengthsUnsorted.bitIndex;
					return shared.PrefixCode.codesFromLengths(prefixCode.codelengths.result);
				},
				postMinimal);

			this.symbolsCodeLengths = new Entity(this.reader, "symbols-codelengths",
				function () {
					var
						symbolsCodeLengths = new Array(alphabetSize).fill(0),
						sum = 0,
						lastSymbol = null,
						lastRepeat = null,
						lastNonZeroCodelength = 8,
						lenNonZeroCodelengths = 0,
						i = 0,
						codeLengthCode, extraBits, newRepeat, j;

					while (i < alphabetSize) {
						codeLengthCode = prefixCode.prefixCodeCodeLengths.result.lookup(this.reader);

						if (typeof codeLengthCode === "string") {
							return codeLengthCode;
						}

						if (codeLengthCode < 16) {
							symbolsCodeLengths[i] = codeLengthCode;
							i += 1;

							lastSymbol = codeLengthCode;
							lastRepeat = null;

							if (codeLengthCode > 0) {
								lastNonZeroCodelength = codeLengthCode;
								lenNonZeroCodelengths += 1;

								sum += 32768 >> codeLengthCode;

								if (sum === 32768) {
									break;
								} else if (sum > 32768) {
									return "Codelengths checksum exceeds 32768 in complex prefix code";
								}
							}
						} else if (codeLengthCode === 16) {
							extraBits = this.reader.readNBits(2);

							if (typeof extraBits === "string") {
								return extraBits;
							}

							if (lastSymbol === 16 && lastRepeat !== null) {
								newRepeat = (4 * (lastRepeat - 2)) + extraBits + 3;

								if (i + newRepeat - lastRepeat > alphabetSize) {
									return "Complex prefix code exceeds alphabet size with non-zero runlength";
								}

								for (; lastRepeat < newRepeat; lastRepeat += 1) {
									symbolsCodeLengths[i] = lastNonZeroCodelength;
									lenNonZeroCodelengths += 1;
									i += 1;

									sum += 32768 >> lastNonZeroCodelength;
								}

								if (sum === 32768) {
									break;
								} else if (sum > 32768) {
									return "Codelengths checksum exceeds 32768 in complex prefix code";
								}
							} else {
								lastRepeat = 3 + extraBits;

								if (i + lastRepeat > alphabetSize) {
									return "Complex prefix code exceeds alphabet size with non-zero runlength";
								}

								for (j = 0; j < lastRepeat; j += 1) {
									symbolsCodeLengths[i] = lastNonZeroCodelength;
									lenNonZeroCodelengths += 1;
									i += 1;

									sum += 32768 >> lastNonZeroCodelength;
								}

								if (sum === 32768) {
									break;
								} else if (sum > 32768) {
									return "Codelengths checksum exceeds 32768 in complex prefix code";
								}
							}

							lastSymbol = 16;
						} else if (codeLengthCode === 17) {
							extraBits = this.reader.readNBits(3);

							if (typeof extraBits === "string") {
								return extraBits;
							}

							if (lastSymbol === 17 && lastRepeat !== null) {
								newRepeat = (8 * (lastRepeat - 2)) + extraBits + 3;
								i += newRepeat - lastRepeat;
								lastRepeat = newRepeat;
							} else {
								lastRepeat = 3 + extraBits;
								i += lastRepeat;
							}

							if (i > alphabetSize) {
								return "Complex prefix code exceeds alphabet size with zero runlength";
							}

							lastSymbol = 17;
						} else {
							unreachable();
							return "unreachable!";
						}
					}

					if (lenNonZeroCodelengths < 2) {
						return "Complex prefix code with less than two non-zero code lengths"
					}

					return symbolsCodeLengths;
				},
				postMinimal);
		}

		function inverseMoveToFrontTransform(v) {
			var mtf = new Array(256).fill(0).map(function (_, i) { _ = _; return i; });

			v.forEach(function (item, i) {
				var
					index = item,
					value = mtf[index],
					j;

				v[i] = value;

				for (j = index; j > 0; j -= 1) {
					mtf[j] = mtf[j - 1];
				}

				mtf[0] = value;
			});

			return v;
		}

		function parserContextMap(reader, nTrees, len) {
			var contextMap = new ContextMap(reader, nTrees, len);

			if (!contextMap.rLeMax.parse()) {
				return contextMap.rLeMax.result;
			}

			if (!contextMap.hTree.parse()) {
				return contextMap.hTree.result;
			}

			if (!contextMap.cMap.parse()) {
				return contextMap.cMap.result;
			}

			if (!contextMap.imtf.parse()) {
				return contextMap.imtf.result;
			}

			if (contextMap.imtf.result === 1) {
				contextMap.cMap.result = inverseMoveToFrontTransform(contextMap.cMap.result);
			}

			return contextMap.cMap.result;
		}

		ContextMap = function (reader, nTrees, len) {
			var contextMap = this;

			this.reader = reader;

			this.rLeMax = new Entity(this.reader, "rlemax",
				function () {
					var result = this.reader.readBit();

					if (typeof result === "string" || result === 0) {
						return result;
					}

					result = this.reader.readNBits(4);

					if (typeof result === "string") {
						return result;
					}

					return result + 1;
				},
				postMinimal);

			this.hTree = new Entity(this.reader, "htreecmap",
				function () {
					return parserPrefixCode(this.reader, contextMap.rLeMax.result + nTrees);
				},
				postMinimal);

			this.cMap = new Entity(this.reader, "cmap",
				function () {
					var
						result = new Array(len),
						runLengthCode, repeat,
						pushed = 0;

					while (pushed < len) {
						runLengthCode = contextMap.hTree.result.lookup(this.reader);

						if (typeof runLengthCode === "string") {
							return runLengthCode;
						}

						if (runLengthCode > 0 && runLengthCode <= contextMap.rLeMax.result) {
							repeat = this.reader.readNBits(runLengthCode);

							if (typeof repeat === "string") {
								return repeat;
							}

							repeat += (1 << runLengthCode);

							if (repeat + pushed > len) {
								return "Context map size overflow";
							}

							result.fill(0, pushed, pushed + repeat);
							pushed += repeat;
						} else {
							result[pushed] = ((runLengthCode === 0) ? 0 : (runLengthCode - contextMap.rLeMax.result));
							pushed += 1;
						}
					}

					return result;
				},
				postMinimal);

			this.imtf = new Entity(this.reader, "imtf", readBit, postMinimal);
		}

		function parserBType(hTreeBType, bType, bTypePrev, nBlTypes) {
			var blockTypeCode = hTreeBType.lookup(this.reader);

			if (typeof blockTypeCode === "string") {
				return blockTypeCode;
			}

			if (blockTypeCode === 0) {
				return bTypePrev;
			} else if (blockTypeCode === 1) {
				return bType + 1 % nBlTypes;
			} else {
				return blockTypeCode - 2;
			}
		}

		Metablock = function (reader) {
			var metablock = this;

			this.reader = reader;
			this.countBytes = 0;

			this.isLast = new Entity(this.reader, "islast", readBit, postMinimal);

			this.isLastEmpty = new Entity(this.reader, "islastempty", readBit, postMinimal);

			this.fillBits0 = new Entity(this.reader, "fillbits-0", readFillBits, postFillBits);

			this.mNibbles = new Entity(this.reader, "mnibbles",
				function () {
					return this.reader.readNBits(2);
				},
				function () {
					this.result = [4, 5, 6, 0][this.result];
				});

			this.mNibblesIsZero = new Entity(this.reader, "mnibbles-is-zero",
				noop,
				function () {
					this.setBitIndex(metablock.mNibbles.bitIndex);
					this.result = metablock.mNibbles.result;
					this.error = metablock.mNibbles.error;
				});

			this.reservedBit0 = new Entity(this.reader, "reserved-bit-0",
				readBit,
				function () {
					if (this.result !== 0) {
						this.error = true;
						this.result = "Reserved, must be zero";
					}
				});

			this.mSkipBytes = new Entity(this.reader, "mskipbytes",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);

			this.mSkipLen = new Entity(this.reader, "mskiplen",
				function () {
					return this.reader.readNBits(8 * metablock.mSkipBytes.result);
				},
				function () {
					if (metablock.mSkipBytes.result > 1 && (this.result >> ((metablock.mSkipBytes.result - 1) * 8)) === 0) {
						this.error = true;
						this.result = "Invalid MSKIPLEN value";
						return;
					}

					this.result += 1;
				});

			this.fillBits1 = new Entity(this.reader, "fillbits-1", readFillBits, postFillBits);

			this.metadata = new Entity(this.reader, "metadata",
				function () {
					return this.reader.readNBits(metablock.mSkipLen.result * 8);
				},
				postMinimal);

			this.mLen = new Entity(this.reader, "mlen",
				function () {
					return this.reader.readNBits(4 * metablock.mNibbles.result);
				},
				function () {
					if (metablock.mNibbles.result > 4 && (this.result >> ((metablock.mNibbles.result - 1) * 4)) === 0) {
						this.error = true;
						this.result = "Invalid MLEN value";
						return;
					}

					this.result += 1;
				});

			this.isUncompressed = new Entity(this.reader, "is-uncompressed", readBit, postMinimal);

			this.fillBits2 = new Entity(this.reader, "fillbits-2", readFillBits, postFillBits);

			this.uncompressedLiterals = new Entity(this.reader, "uncompressed-literals",
				function () {
					return this.reader.readNBytes(metablock.mLen.result);
				},
				function () {
					write_out(this.result);

					this.result.forEach(function (byte) {
						outputWindow.push(byte);
						p.push(byte);
					});
				});

			this.nBlTypesL = new Entity(this.reader, "nbltypesl", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeL = new Entity(this.reader, "htreebtypel",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesL.result + 2);
				},
				postMinimal);

			this.hTreeBLenL = new Entity(this.reader, "htreeblenl", parseHTreeBLen, postMinimal);

			this.bTypeL = new Entity(this.reader, "btypel",
				function () {
					parserBType(metablock.hTreeBTypeL.result, metablock.bTypeL.result, metablock.bTypeLPrev, metablock.nBlTypesL.result);
				},
				postMinimal);

			this.bLenL = new Entity(this.reader, "blenl",
				function () {
					var blockCountCode = metablock.hTreeBLenL.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nBlTypesI = new Entity(this.reader, "nbltypesi", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeI = new Entity(this.reader, "htreebtypei",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesI.result + 2);
				},
				postMinimal);

			this.hTreeBLenI = new Entity(this.reader, "htreebleni", parseHTreeBLen, postMinimal);

			this.bTypeI = new Entity(this.reader, "btypei",
				function () {
					parserBType(metablock.hTreeBTypeI.result, metablock.bTypeI.result, metablock.bTypeIPrev, metablock.nBlTypesI.result);
				},
				postMinimal);

			this.bLenI = new Entity(this.reader, "bleni",
				function () {
					var blockCountCode = metablock.hTreeBLenI.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nBlTypesD = new Entity(this.reader, "nbltypesd", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeD = new Entity(this.reader, "htreebtyped",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesD.result + 2);
				},
				postMinimal);

			this.hTreeBLenD = new Entity(this.reader, "htreeblend", parseHTreeBLen, postMinimal);

			this.bTypeD = new Entity(this.reader, "btyped",
				function () {
					return parserBType(metablock.hTreeBTypeD.result, metablock.bTypeD.result, metablock.bTypeDPrev, metablock.nBlTypesD.result);
				},
				postMinimal);

			this.bLenD = new Entity(this.reader, "blend",
				function () {
					var blockCountCode = metablock.hTreeBLenD.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nPostfix = new Entity(this.reader, "npostfix",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);


			this.nDirect = new Entity(this.reader, "ndirect",
				function () {
					this.result = this.reader.readNBits(4);

					if (typeof this.result === "string") {
						this.error = true;
						return this.result;
					}

					this.result <<= metablock.nPostfix.result;

					return this.result;
				},
				postMinimal);

			this.cMode = new Entity(this.reader, "cmode",
				function () {
					return this.reader.readNWords(metablock.nBlTypesL.result, 2);
				},
				postMinimal);

			this.nTreesL = new Entity(this.reader, "ntreesl", lookupNBlTypes, postNBlTypes);

			this.cMapL = new Entity(this.reader, "cmapl",
				function () {
					return parserContextMap(this.reader, metablock.nTreesL.result, 64 * metablock.nBlTypesL.result);
				},
				postMinimal);

			this.nTreesD = new Entity(this.reader, "ntreesd", lookupNBlTypes, postNBlTypes);

			this.cMapD = new Entity(this.reader, "cmapd",
				function () {
					return parserContextMap(this.reader, metablock.nTreesD.result, 4 * metablock.nBlTypesD.result);
				},
				postMinimal);

			this.hTreeL = new Entity(this.reader, "htreel",
				function () {
					var i, hTree = [];

					for (i = 0; i < metablock.nTreesL.result; i += 1) {
						hTree[i] = parserPrefixCode(this.reader, ALPHABET_SIZE_LITERALS);

						if (typeof hTree[i] === "string") {
							return hTree[i];
						}
					}

					return hTree;
				},
				postMinimal);

			this.hTreeI = new Entity(this.reader, "htreei",
				function () {
					var i, hTree = [];

					for (i = 0; i < metablock.nBlTypesI.result; i += 1) {
						hTree[i] = parserPrefixCode(this.reader, ALPHABET_SIZE_INSERT_AND_COPY_LENGTHS);

						if (typeof hTree[i] === "string") {
							return hTree[i];
						}
					}

					return hTree;
				},
				postMinimal);

			this.hTreeD = new Entity(this.reader, "htreed",
				function () {
					var
						i,
						alphabetSize = 16 + metablock.nDirect.result + (48 << metablock.nPostfix.result),
						hTree = [];

					for (i = 0; i < metablock.nTreesD.result; i += 1) {
						hTree[i] = parserPrefixCode(this.reader, alphabetSize);

						if (typeof hTree[i] === "string") {
							return hTree[i];
						}
					}

					return hTree;
				},
				postMinimal);

			this.insertAndCopyLengthSymbol = new Entity(this.reader, "iaclsymbol",
				function () {
					return metablock.hTreeI.result[metablock.bTypeI.result].lookup(this.reader);
				},
				postMinimal);

			this.insertLengthAndCopyLength = new Entity(this.reader, "ilacl",
				function () {
					var
						insertBaseLengthAndExtraBits = INSERT_LENGTHS_AND_COPY_LENGTHS[metablock.insertAndCopyLengthSymbol.result][0],
						copyBaseLengthAndExtraBits = INSERT_LENGTHS_AND_COPY_LENGTHS[metablock.insertAndCopyLengthSymbol.result][1],
						extraBits, insertLength, copyLength;

					extraBits = this.reader.readNBits(insertBaseLengthAndExtraBits[1]);

					if (typeof extraBits === "string") {
						return extraBits;
					}

					insertLength = insertBaseLengthAndExtraBits[0] + extraBits;

					extraBits = this.reader.readNBits(copyBaseLengthAndExtraBits[1]);

					if (typeof extraBits === "string") {
						return extraBits;
					}

					copyLength = copyBaseLengthAndExtraBits[0] + extraBits;

					return [insertLength, copyLength];
				},
				function () {
					if (metablock.countBytes + metablock.iLen > metablock.mLen.result) {
						this.error = true;
						this.result = "ILEN exceeds expected MLEN";
						return;
					}

					if ((metablock.countBytes + metablock.iLen < metablock.mLen.result) &&
						(metablock.countBytes + metablock.iLen + metablock.cLen > metablock.mLen.result)) {
						this.error = true;
						this.result = "CLEN exceeds expected MLEN";
						return;
					}
				});

			this.cModeBtypeL = new Entity(this.reader, "cmode-btypel",
				function () {
					return metablock.cMode.result[metablock.bTypeL.result];
				},
				postMinimal);

			this.cIdL = new Entity(this.reader, "cidl",
				function () {
					switch (metablock.cModeBtypeL.result) {
						case 0:
							return p.nth(0) & 0x3f;
							break;
						case 1:
							return p.nth(0) >> 2;
							break;
						case 2:
							return LUT_0[p.nth(0)] | LUT_1[p.nth(1)];
							break;
						case 3:
							return (LUT_2[p.nth(0)] << 3) | LUT_2[p.nth(1)];
							break;
					}
				},
				postMinimal);

			this.iLiteral = new Entity(this.reader, "iliteral",
				function () {
					return metablock.hTreeL.result[metablock.cMapL.result[64 * metablock.bTypeL.result + metablock.cIdL.result]].lookup(this.reader);
				},
				function () {
					write_out([this.result]);
					p.push(this.result);
					outputWindow.push(this.result);
				});
		};


		reader = new shared.BitReader(buf);

		wbits = new Entity(reader, "wbits",
			function () {
				return shared.PrefixCode.wbits.lookup(reader);
			},
			postMinimal);

		wbits.parse();

		windowSize = new Entity(reader, "window-size",
			noop,
			function () {
				this.setBitIndex(wbits.bitIndex);
				this.error = wbits.error;

				if (!this.error) {
					this.result = (1 << wbits.result) - 16;
					outputWindow = shared.RingBuffer.withCapacity(this.result);
				} else {
					this.result = wbits.result;
				}
			});

		if (!windowSize.parse()) {
			return;
		}

		do {
			metablock = new Metablock(reader);

			if (!metablock.isLast.parse()) {
				return;
			}

			if (metablock.isLast.result === 1) {
				if (!metablock.isLastEmpty.parse()) {
					return;
				}

				if (metablock.isLastEmpty.result === 1) {
					if (!metablock.fillBits0.parse()) {
						return;
					} else {
						break;
					}

				}
			}

			if (!metablock.mNibbles.parse()) {
				return;
			}

			if (metablock.mNibbles.result === 0) {
				metablock.mNibblesIsZero.parse();

				if (!metablock.reservedBit0.parse()) {
					return;
				}

				if (!metablock.mSkipBytes.parse()) {
					return;
				}

				if (metablock.mSkipBytes.result > 0) {
					if (!metablock.mSkipLen.parse()) {
						return;
					}
				} else {
					metablock.mSkipLen.setResult(0);
					metablock.mSkipLen.setBitIndex(metablock.mSkipBytes.bitIndex);
				}

				if (!metablock.fillBits1.parse()) {
					return;
				}

				if (metablock.mSkipLen.result > 0) {
					if (!metablock.metadata.parse()) {
						return;
					}
				}

				continue;
			}

			if (!metablock.mLen.parse()) {
				return;
			}

			if (metablock.isLast.result === 0) {
				if (!metablock.isUncompressed.parse()) {
					return;
				}

				if (metablock.isUncompressed.result === 1) {
					if (!metablock.fillBits2.parse()) {
						return;
					}

					if (!metablock.uncompressedLiterals.parse()) {
						return;
					}

					continue;
				}
			}

			if (!metablock.nBlTypesL.parse()) {
				return;
			}

			if (metablock.nBlTypesL.result >= 2) {
				if (!metablock.hTreeBTypeL.parse()) {
					return;
				}

				if (!metablock.hTreeBLenL.parse()) {
					return;
				}

				if (!metablock.bLenL.parse()) {
					return;
				}

				metablock.bTypeLPrev = 1;
			} else {
				metablock.bLenL.result = 16777216;
			}

			metablock.bTypeL.result = 0;

			if (!metablock.nBlTypesI.parse()) {
				return;
			}

			if (metablock.nBlTypesI.result >= 2) {
				if (!metablock.hTreeBTypeI.parse()) {
					return;
				}

				if (!metablock.hTreeBLenI.parse()) {
					return;
				}

				if (!metablock.bLenI.parse()) {
					return;
				}

				metablock.bTypeIPrev = 1;
			} else {
				metablock.bLenI.result = 16777216;
			}

			metablock.bTypeI.result = 0;

			if (!metablock.nBlTypesD.parse()) {
				return;
			}

			if (metablock.nBlTypesD.result >= 2) {
				if (!metablock.hTreeBTypeD.parse()) {
					return;
				}

				if (!metablock.hTreeBLenD.parse()) {
					return;
				}

				if (!metablock.bLenD.parse()) {
					return;
				}

				metablock.bTypeDPrev = 1;
			} else {
				metablock.bLenD.result = 16777216;
			}

			metablock.bTypeD.result = 0;

			if (!metablock.nPostfix.parse()) {
				return;
			}

			if (!metablock.nDirect.parse()) {
				return;
			}

			if (!metablock.cMode.parse()) {
				return;
			}

			if (!metablock.nTreesL.parse()) {
				return;
			}

			if (metablock.nTreesL.result >= 2) {
				if (!metablock.cMapL.parse()) {
					return;
				}
			} else {
				metablock.cMapL.result = new Array(metablock.nBlTypesL.result * 64).fill(0);
			}

			if (!metablock.nTreesD.parse()) {
				return;
			}

			if (metablock.nTreesD.result >= 2) {
				if (!metablock.cMapD.parse()) {
					return;
				}
			} else {
				metablock.cMapD.result = new Array(metablock.nBlTypesD.result * 4).fill(0);
			}

			if (!metablock.hTreeL.parse()) {
				return;
			}

			if (!metablock.hTreeI.parse()) {
				return;
			}

			if (!metablock.hTreeD.parse()) {
				return;
			}

			do {
				if (metablock.nBlTypesI.result >= 2 && metablock.bLenI.result === 0) {
					tmp = metablock.bTypeI.result;

					if (!metablock.bTypeI.parse()) {
						return;
					}

					metablock.bTypeIPrev = tmp;

					if (!metablock.bLenI.parse()) {
						return;
					}
				}

				metablock.bLenI.result -= 1;

				if (!metablock.insertAndCopyLengthSymbol.parse()) {
					return;
				}

				if (!metablock.insertLengthAndCopyLength.parse()) {
					return;
				}

				metablock.iLen = metablock.insertLengthAndCopyLength.result[0];
				metablock.cLen = metablock.insertLengthAndCopyLength.result[1];

				for (; metablock.iLen > 0; metablock.iLen -= 1) {
					if (metablock.nBlTypesL.result >= 2 && metablock.bLenL === 0) {
						tmp = metablock.bTypeL.result;

						if (!metablock.bTypeL.result.parse()) {
							return;
						}

						metablock.bTypeLPrev = tmp;

						if (!metablock.bLenL.parse()) {
							return;
						}
					}

					metablock.bLenL.result -= 1;

					if (!metablock.cModeBtypeL.parse()) {
						return;
					}

					if (!metablock.cIdL.parse()) {
						return;
					}

					if (!metablock.iLiteral.parse()) {
						return;
					}

					if (metablock.nBlTypesD.result >= 2 && metablock.bLenD === 0) {
						tmp = metablock.bTypeD.result;

						if (!metablock.bTypeD.result.parse()) {
							return;
						}

						metablock.bTypeDPrev = tmp;

						if (!metablock.bLenD.parse()) {
							return;
						}
					}
				}

				// @NOTE PLACEHOLDER BREAK TO AVOID INFINITE LOOP WHILE WORKING ON IMPLEMENTATION!
				break;
			} while (metablock.countBytes < metablock.mLen.result);
		} while (metablock.isLast.result === 0);

		endOfStream = new Entity(reader, "end-of-stream",
			noop,
			function () {
				this.bitIndex.from = this.reader.globalBitIndex();
				this.bitIndex.to = this.reader.globalBitIndex();
				this.result = "";
			});
		endOfStream.parse();
	}

	function handleInputProcessed() {
		processInput($(this).val());
	}

	$input.on("input/processed", handleInputProcessed);
});
