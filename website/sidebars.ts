import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'quickstart',
    {
      type: 'category',
      label: 'Use-case guides',
      link: {type: 'doc', id: 'hardware/index'},
      items: [
        {
          type: 'category',
          label: 'Send sensor data',
          items: [
            'hardware/raspi_1',
            'hardware/raspi_pico_1',
            'hardware/esp32_1',
          ],
        },
        {
          type: 'category',
          label: 'Send images',
          items: [
            'hardware/rapi_2_cam',
            'hardware/m5_timer_cam',
          ],
        },
        {
          type: 'category',
          label: 'Integrations',
          items: [
            'hardware/swbot_co2',
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
      label: 'Sample code',
      link: {type: 'doc', id: 'samplecode/index'},
      items: [
        'samplecode/python_ex1',
        'samplecode/python_ex2',
        'samplecode/esp32_ex1',
        'samplecode/raspi_cam_ex1',
        'samplecode/M5stack_cam_ex1',
      ],
    },
  ],
};

export default sidebars;
