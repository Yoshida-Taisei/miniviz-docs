---
layout: default
title: API Endpoint (Image)
# parent: API Endpoint
nav_order: 3
---

# Miniviz API Reference (Image)

Miniviz API supports the following endpoints.

## API Endpoint

### Image Transmission API

```text
POST https://api.miniviz.net/api/project/{project_id}/image?token={token}
```


## Request Overview

Image transmission to Miniviz API uses the `POST` method. The request body is in JSON format. Image data is base64 encoded before transmission.

## Request Body (Image Transmission)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `timestamp`  | number | Yes | Transmission time (UNIX time in milliseconds) |
| `label_key`  | string | Yes | Label to identify the source, such as device name or location (max 128 characters, [A-Za-z0-9-_.:@/] only) |
| `image_name` | string | Yes | Image file name (max 255 characters) |
| `image_base64` | string | Yes | Base64 encoded image data (max 200KB) |

## Limitations

### Image Size and Format
- **Image Size**: Maximum 200KB per image (size after base64 encoding)
- **Supported Formats**: JPEG and PNG only
- **Transmission Interval**: 60 seconds/image (managed per label key)
- **Retention Period**: 30 days (※)

※Export feature is scheduled to be released around the end of December 2025.

### Plan Restrictions
- **Available Plans**: Pro plan only (403 error for free plan)

## Request Example (Image Transmission)

```json
{
  "timestamp": 1717587812345,
  "label_key": "camera_1",
  "image_name": "image.jpg",
  "image_base64": "base64_encoded_image_data"
}
```

## curl Command (Linux/MacOS)

```bash

timestamp_ms=$(( $(date -u +%s) * 1000 ))

# Encode image file to base64
image_base64=$(base64 -i image.jpg)

curl -X POST \
  "https://api.miniviz.net/api/project/{project_id}/image?token={token}" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"camera_1\",
        \"image_name\": \"image.jpg\",
        \"image_base64\": \"${image_base64}\"
      }"
```

## View Images

You can preview sent images from the database page.

![View Images](../../images/db_image_1.png)

![View Images](../../images/db_image_2.png)

You can also display images in graphs from the graph creation page.

[Create New Graph] -> [Select Graph Type] -> Select [image]

![Create Image Graph](../../images/viz_image_1.png)

