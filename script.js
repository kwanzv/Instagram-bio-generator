document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("profileForm");
  const resultDiv = document.getElementById("result");
  const bioTextarea = document.getElementById("bio");
  const emojiButton = document.getElementById("emojiButton");
  const emojiPicker = document.getElementById("emojiPicker");

  emojiButton.addEventListener("click", () => {
    emojiPicker.classList.toggle("hidden");
  });

  document
    .querySelector("emoji-picker")
    .addEventListener("emoji-click", (event) => {
      bioTextarea.value += event.detail.unicode;
      emojiPicker.classList.add("hidden");
    });

  if (!form) {
    console.error("Form element not found");
    return;
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach((line, i) => {
      context.fillText(line, x, y + i * lineHeight);
    });

    return lines.length * lineHeight;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value || "";
    const bio = document.getElementById("bio")?.value || "";
    const profilePic = document.getElementById("profilePic")?.files[0];
    const photos = document.getElementById("photos")?.files || [];

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 400;
      canvas.height = 600;

      // Fill background (Instagram white)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add profile picture
      if (profilePic) {
        const img = await createImageBitmap(profilePic);
        ctx.save();
        ctx.beginPath();
        ctx.arc(70, 70, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 20, 20, 100, 100);
        ctx.restore();
      }

      // Add username
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#262626";
      ctx.fillText(name, 140, 50);

      // Add bio
      ctx.font = '14px Arial, "Segoe UI Emoji", "Segoe UI Symbol"';
      ctx.fillStyle = "#262626";
      const bioHeight = wrapText(ctx, bio, 20, 180, 380, 20);
      const bioLines = bio.split("\n");
      bioLines.forEach((line, index) => {
        ctx.fillText(line, 20, 180 + index * 20);
      });

      // Add post count, followers, following
      ctx.font = "bold 14px Arial";
      ctx.fillText("3 posts", 140, 80);

      // Add personal photos
      for (let i = 0; i < Math.min(photos.length, 3); i++) {
        const img = await createImageBitmap(photos[i]);
        ctx.drawImage(img, 20 + i * 125, 400, 115, 115);
      }

      // Convert canvas to image
      const dataUrl = canvas.toDataURL("image/png");

      // Display the result
      if (resultDiv) {
        resultDiv.innerHTML = `
                  <h2 class="text-xl font-bold mb-2">Instagram Profile</h2>
                  <img src="${dataUrl}" alt="Generated Profile" class="max-w-full h-auto rounded-lg shadow-md">
                  <a href="${dataUrl}" download="profile.png" class="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Download Profile Image</a>
              `;
      } else {
        console.error("Result div not found");
        alert(
          "Profile generated successfully, but there was an error displaying it. Please try refreshing the page."
        );
      }
    } catch (error) {
      console.error("Error generating profile:", error);
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="text-red-500">An error occurred while generating the profile. Please try again.</p>`;
      } else {
        alert(
          "An error occurred while generating the profile. Please try again."
        );
      }
    }
  });
});
