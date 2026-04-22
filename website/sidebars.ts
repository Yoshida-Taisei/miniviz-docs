import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'doc',
      id: 'quickstart',
      label: 'QuickStart',
    },
    {
      type: 'category',
      label: 'Use Cases',
      link: {type: 'doc', id: 'hardware/index'},
      items: [
        {
          type: 'category',
          label: 'Send temperature & humidity data',
          items: [
            'hardware/raspi_temp_humidity',
            'hardware/raspi_pico_w_temp_humidity',
            'hardware/esp32_temp_humidity',
          ],
        },
        {
          type: 'category',
          label: 'Send images',
          items: [
            'hardware/raspi_usb_camera',
            'hardware/m5stack_timercam',
          ],
        },
        {
          type: 'category',
          label: 'Integrations',
          items: [
            'hardware/switchbot_co2',
          ],
        },
        {
          type: 'category',
          label: 'その他',
          items: [
            'hardware/esp8266_ir_sensor',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api_endpoint/api_reference',
        'api_endpoint/api_image_reference',
      ],
    },
    {
      type: 'category',
      label: 'Comparison',
      items: [
        'comparison/miniviz_vs_services',
      ],
    },
  ],
};

export default sidebars;
